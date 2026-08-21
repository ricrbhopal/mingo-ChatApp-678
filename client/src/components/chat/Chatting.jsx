import React, { useEffect, useState, useRef } from "react";
import { chatData, userData } from "../../assets/dummy";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import socketAPI from "../../config/webSocket";

const Chatting = ({ selectedFriend, currentUser }) => {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  //console.log(selectedFriend);
  //console.log(currentUser);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredChatData]);

  const fetchChatData = async () => {
    try {
      const res = await api.get(`/user/get-messages/${selectedFriend._id}`);
      setFilteredChatData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch chat data", error);
    }
  };

  const handleMessageSendRestAPI = async () => {
    if (!message) return;
    console.log(message);

    try {
      const res = await api.post("/user/send-message", {
        receiverID: receiver?._id,
        message,
      });
      console.log(res.data.message);
      setMessage("");
      fetchChatData();
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleMessageSendSocket = async () => {
    if (!message) return;
    console.log(message);

    const payload = {
      senderID: user._id,
      receiverID: receiver?._id,
      message,
    };

    const timeStamp = new Date().toISOString();

    try {
      if (socketAPI.connected) {
        socketAPI.emit("send", payload);

        setFilteredChatData((prev) => [
          ...prev,
          {
            senderId: user._id,
            receiverId: receiver?._id,
            message,
            updatedAt: timeStamp,
            createdAt: timeStamp,
          },
        ]);
        setMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleReceiveMessage = (newMessagePack) => {
    console.log("Data Received");

    setFilteredChatData((prev) => [...prev, newMessagePack]);
  };

  useEffect(() => {
    fetchChatData();
    setSender(user);
    setReceiver(selectedFriend);
    // //Polling
    // const interval = setInterval(() => {
    //   fetchChatData();
    // }, 2000);

    // return () => {
    //   clearInterval(interval);
    // };

    if (selectedFriend) {
      socketAPI.on("receive", handleReceiveMessage);
    }

    return () => {
      socketAPI.off("receive", handleReceiveMessage);
    };
  }, [selectedFriend]);

  console.log(filteredChatData);
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-base-100 border-b border-base-300 shadow-sm shrink-0">
        <div className="avatar avatar-placeholder">
          <div className="size-10 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">
            {(receiver?.fullName?.[0] || "?").toUpperCase()}
          </div>
        </div>
        <div>
          <p className="font-semibold text-base-content">{receiver?.fullName || "Select a friend"}</p>
          <p className="text-xs text-success flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-success inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredChatData.map((chat, idx) => (
          <div
            key={idx}
            className={`chat ${chat.senderId !== sender._id ? "chat-start" : "chat-end"}`}
          >
            <div className="chat-header text-xs text-base-content/40 mb-0.5">
              {chat.senderId !== sender._id ? receiver?.fullName : "You"}
            </div>
            <div className={`chat-bubble text-sm ${chat.senderId === sender._id ? "chat-bubble-primary" : ""}`}>
              {chat.message}
            </div>
            <div className="chat-footer text-xs text-base-content/30 mt-0.5">
              {chat.createdAt
                ? new Date(chat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : ""}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 bg-base-100 border-t border-base-300 flex items-end gap-2 shrink-0">
        <button className="btn btn-ghost btn-sm btn-circle text-xl shrink-0">😊</button>
        <textarea
          className="textarea textarea-bordered flex-1 resize-none text-sm min-h-[42px] max-h-32 leading-relaxed"
          placeholder="Type a message... (Enter to send)"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleMessageSendSocket();
            }
          }}
        />
        <button
          onClick={handleMessageSendSocket}
          className="btn btn-primary btn-circle shrink-0"
          disabled={!message.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chatting;
