import { Avatar } from "@chakra-ui/avatar";
import { Box, Button, Center, Divider, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Text, useDisclosure } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { decrypt } from "../hashing";

const ScrollableChat = ({ messages }) => {

  const timeSince = (date) => {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  const { user } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [imageData, setImageData] = useState(null)
  return (
    <><ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const decoded = decrypt(m.content);
          return (
            <div style={{ display: "flex", marginBottom: "5px" }} key={m._id}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                  <Tooltip
                    label={m.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic} />
                  </Tooltip>
                )}
              {m.content_type == "images" &&
                (
                  <SimpleGrid
                    style={{
                      marginLeft: isSameSenderMargin(messages, m, i, user._id),
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                      borderRadius: "20px",
                      maxWidth: "75%",
                    }}
                    columns={{ sm: 2, md: JSON.parse(decoded).length > 3 ? 3 : JSON.parse(decoded).length }} spacing={3}
                  >
                    {JSON.parse(decoded).map((img, index) => {
                      return (
                        <Box
                          key={index}
                          ml="2.5"
                          display="inline-block"
                          position="relative"
                          _hover={{
                            cursor: "zoom-in"
                          }}
                          onClick={() => {
                            onOpen();
                            setImageData({ img: img, time: m.createdAt, sender: m.sender });
                          }}
                        >
                          <Image
                            borderRadius="md"
                            boxSize='120px'
                            objectFit="cover"
                            src={img.url}
                            alt="Images" />
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                )}
              {m.content_type == "text" &&
                (
                  <span
                    style={{
                      backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}`,
                      marginLeft: isSameSenderMargin(messages, m, i, user._id),
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                      borderRadius: "20px",
                      padding: "5px 15px",
                      maxWidth: "75%",
                    }}
                  >
                    {decoded}
                  </span>
                )}
            </div>
          );
        })}
    </ScrollableFeed>
      <Modal onClose={onClose} size="full" isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>

            <Box display="flex" alignItems="center">
              <Avatar
                mr={2}
                size="sm"
                cursor="pointer"
                name={imageData?.sender.name}
                src={imageData?.sender.pic ? imageData?.sender.pic : ""}
              >
              </Avatar>
              <Box display="block" >
                <Text fontSize='sm'>{imageData?.sender.name}</Text>
                <Text fontSize='sm'>{timeSince(new Date(imageData?.time))} - {imageData?.img?.name}</Text>
              </Box>
            </Box>
          </ModalHeader>
          <Divider />
          <ModalCloseButton />
          <ModalBody backgroundImage={imageData?.img?.url} backgroundRepeat="no-repeat" backgroundPosition="center" backgroundSize='contain' >
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal></>
  );
};

export default ScrollableChat;
