import {
    Avatar,
    AvatarBadge,
    Box,
    Button,
    Center,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import { ChatState } from "../Context/ChatProvider";
import { SocketContext } from "../Context/SocketContext";
import ChatLoading from "../components/ChatLoading";
import axios from "axios";
import { getSenderFull } from "../config/ChatLogics";
import { PhoneIcon } from "@chakra-ui/icons";
import Peer from "simple-peer";

const VideoPage = () => {
    const [loggedUser, setLoggedUser] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [idToCall, setIdToCall] = useState("");

    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState();
    const [name, setName] = useState("");
    // const [call, setCall] = useState({});
    // const [me, setMe] = useState('');

    const {
        call,
        me,
        user,
        chats,
        setChats,
        onlineUsers,
        selectedChat,
        setSelectedChat,
        socket,
    } = ChatState();
    const toast = useToast();

    // const { call, answerCall, leaveCall, callUser, me, stream, userVideo, myVideo, callAccepted, name, callEnded, setName, getMyVideoStream } = useContext(SocketContext);
    // console.log("🚀 ~ file: VideoPage.js:21 ~ VideoPage ~ call", call)
    const fetchChats = async () => {
        // console.log(user._id);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(
                process.env.REACT_APP_SERVER_URL + "/api/chat",
                config
            );
            setChats(data);
        } catch (error) {
            console.log("🚀 ~ file: VideoPage.js:31 ~ fetchChats ~ error", error);
            toast({
                title: "Error Occured!",
                description: "Failed to Load the chats",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };
    useEffect(() => {
        if (user) {
            setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
            setName(user.name);
            fetchChats();
        }
    }, [user]);

    // useEffect(() => {
    //     if (user && myVideo.current) {
    //         getMyVideoStream()
    //     }
    // }, [stream])

    // const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    const createVideoTag = () => {
        let video = document.createElement("video");
        video.style.width = 320 + "px";
        video.style.height = 240 + "px";
        video.setAttribute("autoplay", "");
        video.setAttribute("playsinline", "");
        return video;
    };

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                // myVideo.current.srcObject = currentStream;
                const video = createVideoTag();
                video.srcObject = currentStream;
                const videoStreamDiv = document.getElementById("videoStream");
                videoStreamDiv.appendChild(video);
            })
            .catch((err) => {
                console.log("error", err);
            });

        // socket.on("me", (id) => {
        //     console.log("iddd", id)
        //     setMe(id)
        // });

        // socket.on("callUser", ({ from, name: callerName, signal }) => {
        //     setCall({ isReceivingCall: true, from, name: callerName, signal });
        // });
    }, []);

    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: call.from });
        });

        peer.on("stream", (currentStream) => {
            // userVideo.current.srcObject = currentStream;
            const userVideo = createVideoTag();
            userVideo.srcObject = currentStream;
            const userStreamDiv = document.getElementById("userStream");
            userStreamDiv.appendChild(userVideo);
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    };

    const callUser = (id) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: me,
                name,
            });
        });

        peer.on("stream", (currentStream) => {
            // userVideo.current.srcObject = currentStream;
            const userVideo = createVideoTag();
            userVideo.srcObject = currentStream;
            const userStreamDiv = document.getElementById("userStream");
            userStreamDiv.appendChild(userVideo);
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);

            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);

        connectionRef.current.destroy();

        // window.location.reload();
    };

    const checkStatus = (id) => {
        const online = onlineUsers?.some((x) => {
            return x == id;
        });
        if (online) {
            return <AvatarBadge boxSize="1.25em" bg="green.500" />;
        } else {
            return (
                <AvatarBadge borderColor="papayawhip" bg="tomato" boxSize="1.25em" />
            );
        }
    };

    const handleCopyID = () => {
        navigator.clipboard.writeText(me).then(
            function () {
                console.log("Async: Copying to clipboard was successful!");
                toast({
                    title: "Copying to clipboard was successful!",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            },
            function (err) {
                console.error("Async: Could not copy text: ", err);
                toast({
                    title: "Could not copy text",
                    description: err.response.data.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        );
    };

    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <Box m="2">
                {chats ? (
                    <SimpleGrid minChildWidth="120px" spacing="40px">
                        {chats.map((chat) => {
                            const chatDetail =
                                !chat.isGroupChat && getSenderFull(loggedUser, chat.users);
                            return (
                                <Box
                                    _hover={{ background: "#3182CE" }}
                                    cursor="pointer"
                                    px={3}
                                    py={2}
                                    borderRadius="lg"
                                    display="flex"
                                    justifyContent="space-between"
                                    key={chat._id}
                                >
                                    {!chat.isGroupChat && (
                                        <>
                                            <Box display="flex" alignItems="center">
                                                <Avatar
                                                    mr={2}
                                                    size="sm"
                                                    cursor="pointer"
                                                    name={chatDetail.name}
                                                    src={chatDetail.pic ? chatDetail.pic : ""}
                                                >
                                                    {checkStatus(chatDetail._id)}
                                                </Avatar>
                                                <Text>{chatDetail.name}</Text>
                                            </Box>
                                            <IconButton
                                                d={{ base: "flex" }}
                                                icon={<PhoneIcon />}
                                                onClick={() => {
                                                    onOpen();
                                                    setSelectedChat(chat);
                                                }}
                                            />
                                        </>
                                    )}
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                ) : (
                    <ChatLoading />
                )}
            </Box>
            <Box m="2">
                <SimpleGrid columns={2} spacing={10}>
                    {user && (
                        <>
                            <Box>
                                <div>
                                    <Text
                                        fontSize={{ base: "28px", md: "30px" }}
                                        fontFamily="Work sans"
                                    >
                                        {user.name || "Name"}
                                    </Text>
                                    <div id="videoStream"></div>
                                    {/* <video width="452"  playsInline muted ref={myVideo} autoPlay /> */}
                                </div>
                            </Box>
                            <Box>
                                {callAccepted && !callEnded && (
                                    <div>
                                        <Text
                                            fontSize={{ base: "28px", md: "30px" }}
                                            fontFamily="Work sans"
                                        >
                                            {call.name ||
                                                (!selectedChat.isGroupChat &&
                                                    getSenderFull(loggedUser, selectedChat.users)
                                                        ?.name) ||
                                                "Name"}
                                        </Text>
                                        <div id="userStream">
                                            {/* <video width="452" playsInline muted ref={userVideo} autoPlay /> */}
                                        </div>
                                    </div>
                                )}
                            </Box>
                        </>
                    )}
                </SimpleGrid>
                <Center mt="5">
                    {callAccepted && !callEnded && (
                        <Button colorScheme="red" onClick={leaveCall}>
                            Hang Up
                        </Button>
                    )}
                </Center>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Video Call </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex>
                            <Center>
                                <Text
                                    fontSize="var(--chakra-fontSizes-xl)"
                                    fontWeight="var(--chakra-fontWeights-semibold)"
                                    mr="2"
                                    fontFamily="Work sans"
                                >
                                    Code:
                                </Text>
                                <Input
                                    value={idToCall}
                                    type="text"
                                    placeholder="ID to calll"
                                    onChange={(e) => setIdToCall(e.target.value)}
                                />
                            </Center>
                        </Flex>
                        {call.isReceivingCall && !callAccepted && (
                            <Flex mt="2">
                                <Center>
                                    <Text
                                        fontSize="var(--chakra-fontSizes-xl)"
                                        fontWeight="var(--chakra-fontWeights-semibold)"
                                        mr="2"
                                        fontFamily="Work sans"
                                    >
                                        {call.name} is calling:
                                    </Text>
                                    <Button
                                        colorScheme="blue"
                                        onClick={() => {
                                            answerCall();
                                            onClose();
                                        }}
                                    >
                                        Answer
                                    </Button>
                                </Center>
                            </Flex>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        {callAccepted && !callEnded ? (
                            <Button colorScheme="red" onClick={leaveCall}>
                                Hang Up
                            </Button>
                        ) : (
                            <Button
                                colorScheme="green"
                                onClick={() => {
                                    callUser(idToCall);
                                    onClose();
                                }}
                            >
                                Call
                            </Button>
                        )}
                        {/* <Button colorScheme='green'>Call</Button> */}
                        <Button ml="2" colorScheme="blue" onClick={handleCopyID}>
                            Copy Your ID
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default VideoPage;
