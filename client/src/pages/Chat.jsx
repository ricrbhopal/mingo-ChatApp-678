import React, { useEffect, useState } from "react";
import { userData } from "../assets/dummy";
import Chatting from "../components/chat/Chatting";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import socketAPI from "../config/webSocket";

const Chat = () => {
  const navigate = useNavigate();
  const { user, isLogin } = useAuth();
  const [recentUser, setRecentUser] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isOpenChat, setIsOpenChat] = useState(false);

  const fetchRecentUsers = async () => {
    // Simulate fetching recent users from an API
    try {
      const res = await api.get("/user/allusers");
      setRecentUser(res.data.data);
    } catch (error) {
      console.error("Failed to fetch recent users", error);
    }
  };

  // console.log(user);
  //const currentUser = 1;
  console.log(recentUser);

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }

    if (isLogin && user) {
      socketAPI.emit("OmBhramyaNamah", user._id);
      fetchRecentUsers();
    }

    return () => {
      socketAPI.emit("OmNamahShivay", user._id);
    };
  }, []);

  return (
    <>
      {isLogin && (
        <div className="flex gap-2">
          <div className="w-3/17 bg-base-200">
            <h1>Recent Chats</h1>

            {recentUser.length > 0 &&
              recentUser.map((friend, idx) => (
                <div
                  key={idx}
                  onClick={() => { setSelectedFriend(friend); setIsOpenChat(true); }}
                  className="cursor-pointer"
                >
                  {friend.fullName}
                </div>
              ))}
          </div>
          <div className="w-14/17">
            {selectedFriend ? (
              <Chatting
                selectedFriend={selectedFriend}
                currentUser={user}
              />
            ) : (
              <div>Select a Friend to start chat</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
