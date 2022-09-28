import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory, useNavigate } from "react-router-dom";

import io from "socket.io-client";
const ENDPOINT = "http://localhost:5000";
var socket;

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (userInfo) {
      socket = io(ENDPOINT);
      socket.emit("setup", userInfo);
      socket.on("connected", (data) => {
        setSocketConnected(true);
        setOnlineUsers(data);
      });
    }

    if (!userInfo) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        onlineUsers,
        setOnlineUsers,
        socket,
        socketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
