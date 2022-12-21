import { PhoneIcon, ViewIcon } from "@chakra-ui/icons";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    IconButton,
    Text,
    Image,
    Input,
    FormLabel,
    Flex,
    Center,
    useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../Context/SocketContext";

const VideoModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { stream, userVideo, myVideo, answerCall, me, callAccepted, name, call, setName, callEnded, leaveCall, callUser } = useContext(SocketContext);
    const toast = useToast();
    const [idToCall, setIdToCall] = useState('');
    setName(user.name)

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
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton d={{ base: "flex" }} icon={<PhoneIcon />} onClick={onOpen} />
            )}
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent h="410px">
                    <ModalHeader
                        fontSize="40px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        Video Call
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDir="column"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            fontFamily="Work sans"
                        >
                            Name: {user.name}
                        </Text>
                        <Flex>
                            <Center>

                                <Text fontSize={{ base: "28px", md: "30px" }} mr="2"
                                    fontFamily="Work sans">Code:</Text>
                                <Input
                                    value={idToCall}
                                    type="text"
                                    placeholder="ID to calll"
                                    onChange={(e) => setIdToCall(e.target.value)}
                                />
                            </Center>
                        </Flex>
                        <Flex>
                            <Button mr="2" colorScheme='blue' onClick={handleCopyID} >Copy Your ID</Button>
                            {callAccepted && !callEnded ? (
                                <Button colorScheme='red' onClick={leaveCall} >Hang Up</Button>
                            ) : (
                                <Button colorScheme='green' onClick={() => callUser(idToCall)} >call</Button>
                            )}
                        </Flex>
                        <div>
                            {call.isReceivingCall && !callAccepted && (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Text fontSize={{ base: "28px", md: "30px" }} mr="2"
                                        fontFamily="Work sans">{call.name} is calling:</Text>
                                    <Button colorScheme="blue" onClick={answerCall}>
                                        Answer
                                    </Button>
                                </div>
                            )}
                        </div>
                        {/* {
                            callAccepted && !callEnded && <div>
                                <Text fontSize={{ base: "28px", md: "30px" }}
                                    fontFamily="Work sans">{name || 'Name'}</Text>
                                <video playsInline muted ref={userVideo} autoPlay />
                            </div>
                        }
                        {
                            stream &&
                            <div>
                                <Text fontSize={{ base: "28px", md: "30px" }}
                                    fontFamily="Work sans">{name || 'Name'}</Text>
                                <video playsInline muted ref={myVideo} autoPlay />
                            </div>
                        } */}

                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default VideoModal;
