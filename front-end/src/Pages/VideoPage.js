import { Avatar, AvatarBadge, Box, Button, Center, Flex, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Text, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react'
import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import { ChatState } from '../Context/ChatProvider';
import { SocketContext } from '../Context/SocketContext';
import ChatLoading from "../components/ChatLoading";
import axios from 'axios';
import { getSenderFull } from '../config/ChatLogics';
import { PhoneIcon } from '@chakra-ui/icons';

const VideoPage = () => {
    const [loggedUser, setLoggedUser] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [idToCall, setIdToCall] = useState('');

    const { user, chats, setChats, onlineUsers, selectedChat, setSelectedChat } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const toast = useToast();

    const { call, answerCall, leaveCall, callUser, me, stream, userVideo, myVideo, callAccepted, name, callEnded, setName } = useContext(SocketContext);
    const fetchChats = async () => {
        // console.log(user._id);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(process.env.REACT_APP_SERVER_URL + "/api/chat", config);
            setChats(data);
        } catch (error) {
            console.log("🚀 ~ file: VideoPage.js:31 ~ fetchChats ~ error", error)
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
            setName(user.name)
            fetchChats()
        }
    }, [user])

    useEffect(() => {

        console.log("🚀 ~ file: VideoPage.js:54 ~ VideoPage ~ call", call)
    }, [call])

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
        navigator.clipboard.writeText(me).then(function () {
            console.log('Async: Copying to clipboard was successful!');
            toast({
                title: "Copying to clipboard was successful!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });

        }, function (err) {
            console.error('Async: Could not copy text: ', err);
            toast({
                title: "Could not copy text",
                description: err.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
        });
    }

    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <Box m="2" >

                {chats ? (
                    <SimpleGrid minChildWidth='120px' spacing='40px'>
                        {
                            chats.map((chat) => {
                                const chatDetail =
                                    !chat.isGroupChat && getSenderFull(loggedUser, chat.users);
                                return <Box
                                    _hover={{ background: "#3182CE" }}
                                    cursor="pointer"
                                    px={3}
                                    py={2}
                                    borderRadius="lg"
                                    display="flex"
                                    justifyContent="space-between"
                                >{
                                        !chat.isGroupChat ? (
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
                                        )
                                    }
                                    < IconButton d={{ base: "flex" }} icon={<PhoneIcon />} onClick={() => {
                                        onOpen()
                                        setSelectedChat(chat)
                                    }} />
                                </Box>
                            })
                        }
                    </SimpleGrid>
                ) : (
                    <ChatLoading />
                )}
            </Box>
            <Box
                display="flex"
                justifyContent="space-between"
                w="100%"
                h="91.5vh"
                p="10px"
            >
                <Grid>
                    <GridItem>

                        {user &&

                            callAccepted && !callEnded && <div>
                                <Text fontSize={{ base: "28px", md: "30px" }}
                                    fontFamily="Work sans">{name || user.name || 'Name'}</Text>
                                <video width="400" playsInline muted ref={userVideo} autoPlay />
                            </div>
                        }
                    </GridItem>
                    <GridItem>

                        {
                            stream &&
                            <div>
                                <Text fontSize={{ base: "28px", md: "30px" }}
                                    fontFamily="Work sans">{name || user.name || 'Name'}</Text>
                                <video width="400" playsInline muted ref={myVideo} autoPlay />
                            </div>

                        }
                    </GridItem>
                    {callAccepted && !callEnded && (
                        <Button colorScheme='red' onClick={leaveCall} >Hang Up</Button>
                    )
                    }
                </Grid>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Video Call </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex>
                            <Center>

                                <Text fontSize="var(--chakra-fontSizes-xl)" fontWeight="var(--chakra-fontWeights-semibold)" mr="2"
                                    fontFamily="Work sans">Code:</Text>
                                <Input
                                    value={idToCall}
                                    type="text"
                                    placeholder="ID to calll"
                                    onChange={(e) => setIdToCall(e.target.value)}
                                />
                            </Center>
                        </Flex>
                        {call.isReceivingCall && !callAccepted && (
                            <Flex mt="2" >
                                <Center>

                                    <Text fontSize="var(--chakra-fontSizes-xl)" fontWeight="var(--chakra-fontWeights-semibold)" mr="2"
                                        fontFamily="Work sans">{call.name} is calling:</Text>
                                    <Button colorScheme="blue" onClick={() => {
                                        answerCall()
                                        onClose()
                                    }}>
                                        Answer
                                    </Button>
                                </Center>
                            </Flex>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        {callAccepted && !callEnded ? (
                            <Button colorScheme='red' onClick={leaveCall} >Hang Up</Button>
                        ) : (
                            <Button colorScheme='green' onClick={() => {
                                callUser(idToCall)
                                onClose()
                            }} >Call</Button>
                        )}
                        {/* <Button colorScheme='green'>Call</Button> */}
                        <Button ml="2" colorScheme='blue' onClick={handleCopyID} >Copy Your ID</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    )
}

export default VideoPage