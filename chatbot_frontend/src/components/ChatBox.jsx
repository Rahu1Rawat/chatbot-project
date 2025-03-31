import rightArrow from "../assets/right-arrow.svg";
import catSvg from "../assets/cat.svg";
// import logo from "../assets/CB_Logo.png"
// import personSvg from "../assets/person.svg"
import uploadSvg from "../assets/upload.svg";
import plusSvg from "../assets/plus.svg";
import { useEffect, useRef, useState } from "react";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        console.error("Error Sending Message");
        return;
      }

      // Create a new assistant message with an empty response
      let aiMessage = { role: "assistant", text: "" };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiMessage.text += chunk;

        // Update state so UI updates dynamically
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          aiMessage,
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("Selected File:", file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Error uploading file");
        return;
      }

      const data = await response.json();
      console.log("Extracted Text:", data.text);
      alert("PDF uploaded successfully!");

    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading PDF.");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#FAFAFA] rounded-lg h-full flex flex-col justify-between p-3">
      <div className="flex justify-between items-center border-b">
        <div className="font-semibold">Chat with Cohere</div>
        <div>
          <img src={catSvg} alt="Cat icon" className="w-5 h-5" />
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex flex-1 py-3">
        <div className="flex flex-1 rounded-lg">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-4xl font-semibold">
              Try a prompt in Chat mode
            </div>
          ) : (
            <div className="w-full h-[478.8px] overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-[80%] break-words ${
                    message.role === "user"
                      ? "bg-[#DFDAD1] self-end"
                      : "bg-[#EFECE8] self-start"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex justify-between items-center flex-1 p-2 border border-[#8E8572] rounded-lg">
          <div className="w-full p-1">
            <textarea
              className="resize-none w-full focus:outline-none bg-[#FAFAFA]"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
          </div>
          <div onClick={sendMessage} className="cursor-pointer">
            <img src={rightArrow} alt="Right Arrow" className="w-5 h-5" />
          </div>
        </div>
        <div className="h-full flex flex-col justify-between p-1 border border-[#8E8572] rounded-lg">
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} />
            <img src={uploadSvg} alt="Upload Icon" className="w-6 h-6" />
          </label>
          <div className="w-full bg-[#8E8572] h-[1px]"></div>
          <div>
            <img src={plusSvg} alt="Plus Icon" className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
