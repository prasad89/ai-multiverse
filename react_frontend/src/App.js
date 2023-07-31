import "./App.css";
import React, { useState, createContext } from "react";
import ChatBox from "./Component/ChatBox";

export const ChatContext = createContext();

export const MODELS = ["gpt-3.5-turbo", "command-nightly", "stable-diffusion"];

function App() {
  const [syncChat, setSyncChat] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [sendBtn, setSendBtn] = useState(false);
  const [chatBoxes, setChatBoxes] = useState([
    {
      id: Date.now(),
    },
  ]);
  const [componentCount, setComponentCount] = useState(1);

  const addChatBox = () => {
    if (componentCount < 3) {
      setChatBoxes((prevChatBoxes) => [
        ...prevChatBoxes,
        {
          id: Date.now(),
        },
      ]);
      setComponentCount((prevCount) => prevCount + 1);
    }
  };

  const removeChatBox = () => {
    if (componentCount > 1) {
      setChatBoxes((prevChatBoxes) => prevChatBoxes.slice(0, -1));
      setComponentCount((prevCount) => prevCount - 1);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center align-content-center">
        <button className="btn btn-dark">
          <label className="form-check-label">Sync Chats</label>
          <input
            className="form-check-input ms-2"
            type="checkbox"
            checked={syncChat}
            onChange={(e) => setSyncChat(e.target.checked)}
            id="flexCheckChecked"
          />
        </button>
        <button className="btn btn-dark ms-2" onClick={addChatBox}>
          +
        </button>
        <button className="btn btn-dark ms-2" onClick={removeChatBox}>
          -
        </button>
      </div>
      <ChatContext.Provider
        value={{
          syncMsg,
          setSyncMsg,
          syncChat,
          sendBtn,
          setSendBtn,
        }}
      >
        <div className="container-fluid">
          <div className="row">
            {chatBoxes.map((item, index) => (
              <ChatBox key={item.id} index={index} />
            ))}
          </div>
        </div>
      </ChatContext.Provider>
    </>
  );
}

export default App;
