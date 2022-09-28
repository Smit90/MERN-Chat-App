import { Box, Text } from "@chakra-ui/react";
import React from "react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const SettingPage = () => {
  const { user } = ChatState();
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        // justifyContent="space-between"
        justifyContent="center"
        w="100%"
        h="91.5vh"
        p="10px"
        alignItems="center"
      >
        <Text fontSize="5xl">Coming Soon!</Text>
      </Box>
    </div>
  );
};

export default SettingPage;
