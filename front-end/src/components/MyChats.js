import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderFull, getReceiver } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Avatar, AvatarBadge, background, Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats, onlineUsers } =
    ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
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
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

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

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => {
              const chatDetail =
                !chat.isGroupChat && getSenderFull(loggedUser, chat.users);

              return (
                <Box
                  _hover={{ background: "#3182CE" }}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#3182CE" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                  // display="flex"
                >
                  {!chat.isGroupChat ? (
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
                  ) : (
                    <Box display="flex" alignItems="center">
                      <Avatar
                        mr={2}
                        size="sm"
                        cursor="pointer"
                        name={chat.chatName}
                      />
                      <Box>
                        <Text>{chat.chatName}</Text>
                      </Box>
                    </Box>
                  )}
                  {chat.latestMessage && (
                    <Text fontSize="xs" mt={2}>
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
