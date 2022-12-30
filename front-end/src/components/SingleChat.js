import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import {
  IconButton,
  Spinner,
  useToast,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  InputLeftAddon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Button,
  Avatar,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowBackIcon,
  AtSignIcon,
  AttachmentIcon,
  ChevronDownIcon,
  DeleteIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { useRef } from "react";
import { decrypt, encrypt } from "../hashing";
// const ENDPOINT = "http://localhost:5000";
// var socket
var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [previewURLs, setPreviewURLs] = useState([]);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [hoverImageId, setHoverImageId] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);

  // const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const toast = useToast();
  const attachmentRef = useRef(null);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    setOnlineUsers,
    socket,
    socketConnected,
  } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        process.env.REACT_APP_SERVER_URL + `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket && socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && previewURLs.length !== 0) {
      uploadToCloundinary()
    }
    if (event.key === "Enter" && newMessage) {
      socket && socket.emit("stop typing", selectedChat._id);
      sendMessageToServer(newMessage, 'text')
    }
  };

  const sendMessageToServer = async (message, type) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewMessage("");
      setPreviewURLs([])
      const { data } = await axios.post(
        process.env.REACT_APP_SERVER_URL + "/api/message",
        {
          content: encrypt(message),
          chatId: selectedChat,
          content_type: type
        },
        config
      );
      socket && socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }

  useEffect(() => {
    // socket = io(ENDPOINT);
    // socket.emit("setup", user);
    // socket.on("connected", (data) => {
    //   setSocketConnected(true);
    //   setOnlineUsers(data);
    // });
    if (socket) {
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }

    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
    return () => {
      setPreviewURLs([])
      setNewMessage("")
      setEmojiPickerOpen(false)
    }
  }, [selectedChat]);

  useEffect(() => {
    socket &&
      socket.on("message recieved", (newMessageRecieved) => {
        if (
          !selectedChatCompare || // if chat is not selected or doesn't match current chat
          selectedChatCompare._id !== newMessageRecieved.chat._id
        ) {
          console.log("inside if");
          if (!notification.includes(newMessageRecieved)) {
            setNotification([newMessageRecieved, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          console.log("inside else");
          setMessages([...messages, newMessageRecieved]);
        }
      });
    return () => {
      socket && socket.off("message recieved");
    };
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket && socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket && socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleOpenEmojiPicker = () => {
    setEmojiPickerOpen(!emojiPickerOpen);
  };

  // const handleMentionKey = (e) => {
  //   if (e.key == "@") {
  //     console.log("mention");
  //   }
  // };

  const handleAtUser = (user) => {
    const userName = "@" + user.name;
    setNewMessage((prev) => (prev ? prev + " " + userName : userName));
  };

  const leftInputAddon = () => {
    const sender = JSON.parse(localStorage.getItem("userInfo"));
    return (
      <InputLeftAddon>
        <Menu>
          {({ isOpen }) => (
            <>
              <MenuButton>
                <AtSignIcon cursor="pointer" />
              </MenuButton>
              <MenuList>
                {selectedChat.users &&
                  selectedChat.users.map((user, index) => {
                    return (
                      <MenuItem
                        key={index}
                        minH="48px"
                        onClick={() => handleAtUser(user)}
                      >
                        <Avatar
                          mr={2}
                          size="sm"
                          cursor="pointer"
                          name={user.name}
                          src={user.pic ? user.pic : ""}
                        />
                        <span>
                          {sender.email == user.email
                            ? user.name + " (You)"
                            : user.name}
                        </span>
                      </MenuItem>
                    );
                  })}
              </MenuList>
            </>
          )}
        </Menu>
      </InputLeftAddon>
    );
  };

  const randstr = (prefix) => {
    return Math.random()
      .toString(36)
      .replace("0.", prefix || "");
  };

  const createURLFromImage = (files) => {
    const previewArr = files.map((file) => {
      return { name: file.name, id: randstr(), url: URL.createObjectURL(file), file: file };
    });
    setPreviewURLs(previewArr);
  };


  const uploadToCloundinary = async () => {
    setLoading(true)
    const uploaders = previewURLs.map(file => {
      const data = new FormData();
      data.append("file", file.file);
      data.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
      data.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);

      // Make an AJAX upload request using Axios (replace Cloudinary URL below with your own)
      return axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`, data, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
    });

    // Once all the files are uploaded 
    axios.all(uploaders)
      .then((ress) => {
        setLoading(false)
        setPreviewURLs([])
        console.log(ress, "ress")
        const images = ress.map((img) => {
          return { name: img.data.original_filename, url: img.data.secure_url, content_type: img.data.resource_type }
        })
        sendMessageToServer(JSON.stringify(images), 'images')

        // ... perform after upload is successful operation
      });

  }

  const handleFileUpload = (event) => {
    const files = Array.prototype.slice.call(event.target.files);
    if (files.length > 10) {
      toast({
        title: "Upload Limit",
        description: "You can only upload 10 files at a time.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      createURLFromImage(files.slice(0, 10));
      // setUploadFiles(files.slice(0, 10))
    } else {
      createURLFromImage(files);
      // setUploadFiles(files)
    }
  };

  const handleRemoveImg = (img) => {
    const newArr = previewURLs.filter((x) => x.id !== img.id)
    setPreviewURLs(newArr);
    if (newArr.length == 0) {
      attachmentRef.current.value = null
    }
  };

  const showRemoveImageIcon = (img) => {
    return (
      <>
        <IconButton
          position="absolute"
          top="25%"
          right="25%"
          d={{ base: "flex", md: "none" }}
          icon={<DeleteIcon boxSize={5} color="red.500" />}
          background="whiteAlpha.800"
          onClick={() => handleRemoveImg(img)}
        />
      </>
    );
  };

  const rightInputElement = () => {
    return (
      <InputRightElement width="4.5rem">
        <AttachmentIcon
          ref={attachmentRef}
          marginRight="5px"
          cursor="pointer"
          onClick={() => attachmentRef.current.click()}
        />
        <Input
          ref={attachmentRef}
          type="file"
          multiple={true}
          hidden={true}
          onChange={handleFileUpload}
        />
        {!emojiPickerOpen ? (
          <svg
            cursor="pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            onClick={handleOpenEmojiPicker}
          >
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.508 13.941c-1.513 1.195-3.174 1.931-5.507 1.931-2.335 0-3.996-.736-5.509-1.931l-.492.493c1.127 1.72 3.2 3.566 6.001 3.566 2.8 0 4.872-1.846 5.999-3.566l-.492-.493zm.492-3.939l-.755.506s-.503-.948-1.746-.948c-1.207 0-1.745.948-1.745.948l-.754-.506c.281-.748 1.205-2.002 2.499-2.002 1.295 0 2.218 1.254 2.501 2.002zm-7 0l-.755.506s-.503-.948-1.746-.948c-1.207 0-1.745.948-1.745.948l-.754-.506c.281-.748 1.205-2.002 2.499-2.002 1.295 0 2.218 1.254 2.501 2.002z" />
          </svg>
        ) : (
          <svg
            cursor="pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            onClick={handleOpenEmojiPicker}
          >
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3.5 8c.828 0 1.5.671 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.671-1.5-1.5.672-1.5 1.5-1.5zm-7 0c.828 0 1.5.671 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.671-1.5-1.5.672-1.5 1.5-1.5zm3.501 10c-2.801 0-4.874-1.846-6.001-3.566l.493-.493c1.512 1.195 3.174 1.931 5.508 1.931 2.333 0 3.994-.736 5.506-1.931l.493.493c-1.127 1.72-3.199 3.566-5.999 3.566z" />
          </svg>
        )}
      </InputRightElement>
    );
  };

  const previewBox = () => {
    return (
      <Box mt="2.5">
        {previewURLs.map((img) => {
          return (
            <Box
              id={img.id}
              key={img.id}
              mr="2.5"
              display="inline-block"
              position="relative"
              onMouseEnter={() => {
                setShowDeleteIcon(true);
                setHoverImageId(img.id);
              }}
              onMouseLeave={() => {
                setShowDeleteIcon(false);
                setHoverImageId(null);
              }}
            >
              <Image
                borderRadius="md"
                boxSize="75px"
                objectFit="cover"
                src={img.url}
                alt={img.name}
                filter="auto"
                brightness={hoverImageId == img.id ? "40%" : "100%"}
              />
              {showDeleteIcon &&
                hoverImageId == img.id &&
                showRemoveImageIcon(img)}
            </Box>
          );
        })}
      </Box>
    )
  }

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <div>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </div>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            {emojiPickerOpen && (
              <Picker
                data={data}
                onEmojiSelect={(e) => {
                  setNewMessage((prev) => prev + e.native);
                  setEmojiPickerOpen(false);
                }}
              />
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box alignItems="center">
                <InputGroup size="md">
                  {selectedChat.isGroupChat && leftInputAddon()}
                  <Input
                    autoComplete="off"
                    contentEditable
                    variant="filled"
                    bg="#E0E0E0"
                    placeholder="Enter a message.."
                    value={newMessage}
                    onChange={typingHandler}
                    mr={2}
                  // onKeyDown={handleMentionKey}
                  />
                  {rightInputElement()}
                </InputGroup>
                {previewURLs.length !== 0 && previewBox()}
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
