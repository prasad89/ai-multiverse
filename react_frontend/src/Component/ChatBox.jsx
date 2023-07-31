import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { ChatContext, MODELS } from "../App";
import {} from "../App";

const ChatBox = ({ index }) => {
  const { syncMsg, setSyncMsg, syncChat, sendBtn, setSendBtn } =
    useContext(ChatContext);
  const [selectedModel, setSelectedModel] = useState(MODELS[index % 3]);
  const [stableInput, setStableInput] = useState("");
  const [stableInputMessage, setStableInputMessage] = useState([]);
  const [sendButtonDisabled, setSendButtonDisabled] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [stableResponseMessage, setStableResponseMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const sendButtonRef = useRef("");

  const modelOptions = [
    { value: "command-nightly", label: "command-nightly" },
    { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
    { value: "stable-diffusion", label: "stable-diffusion" },
  ];

  const handleModelChange = useCallback((event) => {
    setSelectedModel(event.target.value);
  }, []);

  const clearChat = useCallback(() => {
    setStableInputMessage([]);
  }, []);

  const sendStableInput = useCallback(async () => {
    if (!stableInput.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setStableInputMessage((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        answer: stableInput,
        model: "User",
      },
    ]);

    setSendButtonDisabled(true);
    setSpinner(true);

    try {
      const response = await fetch(`http://localhost:5000/getres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: stableInput,
          model: selectedModel,
        }),
      });
      const data = await response.json();
      setStableResponseMessage({
        id: Date.now(),
        answer: data.answer,
        model: selectedModel,
      });
      setStableInput("");
    } catch (error) {
      console.error("Error fetching response from the server:", error);
    } finally {
      setSpinner(false);
      setSendButtonDisabled(false);
    }
  }, [stableInput, selectedModel]);

  useEffect(() => {
    if (stableResponseMessage) {
      setStableInputMessage((prevMessages) => [
        ...prevMessages,
        stableResponseMessage,
      ]);
      setStableResponseMessage("");
    }
  }, [stableResponseMessage]);

  const handleKeyDown = useCallback((event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      sendButtonRef.current.click();
    }
  }, []);

  useEffect(() => {
    if (syncChat) {
      setStableInput(syncMsg);
    }
  }, [syncChat, syncMsg]);

  useEffect(() => {
    if (stableInput && stableInput.length && syncChat && sendBtn) {
      sendStableInput();
      setTimeout(() => {
        setSendBtn(false);
      }, 1000);
    }
  }, [sendBtn, setSendBtn, stableInput, syncChat, sendStableInput]);

  return (
    <div className="col" style={{ height: "85vh" }}>
      <div className="d-flex justify-content-evenly align-content-center">
        <select
          className="btn btn-dark dropdown-toggle"
          value={selectedModel}
          onChange={handleModelChange}
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="btn btn-dark" onClick={clearChat}>
          Clear Chat
        </button>
      </div>
      {showError && (
        <div
          className="alert alert-danger alert-dismissible fade show mt-2"
          role="alert"
        >
          <strong>Error!</strong> Your message can't be empty.
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setShowError(false)}
          ></button>
        </div>
      )}
      <div className="overflow-y-auto mb-3" style={{ height: "85%" }}>
        {stableInputMessage &&
          stableInputMessage.length !== 0 &&
          stableInputMessage.map((item) => (
            <div
              key={item.id}
              className={`${
                item.model === "User"
                  ? "d-flex justify-content-end"
                  : "d-flex justify-content-start"
              }`}
            >
              <div className="card mask-custom w-50">
                <div className="card-body">
                  {item.model === "stable-diffusion" &&
                  item.answer.startsWith("https://") ? (
                    <img
                      className="img-fluid"
                      src={item.answer}
                      alt={item.answer}
                    />
                  ) : (
                    <p className="fw-bold">{item.answer}</p>
                  )}
                  <em className="small d-flex justify-content-end">
                    {item.model}
                  </em>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="d-flex justify-content-evenly align-content-center">
        <input
          className="form-control"
          placeholder="Type your message..."
          type="text"
          value={stableInput}
          onChange={(e) =>
            !syncChat
              ? setStableInput(e.target.value)
              : setSyncMsg(e.target.value)
          }
          onKeyDown={handleKeyDown}
          required
          disabled={spinner || sendButtonDisabled}
        />
        <button
          ref={sendButtonRef}
          className="btn btn-primary ms-2"
          type="button"
          onClick={!syncChat ? sendStableInput : () => setSendBtn(true)}
          hidden={sendButtonDisabled}
        >
          Send&ensp;🚀
        </button>
        {spinner && (
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
