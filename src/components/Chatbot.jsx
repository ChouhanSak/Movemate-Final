import React, { useState } from "react";
import axios from "axios";
import { MessageSquare, Copy, Pencil, RotateCcw } from "lucide-react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Mic } from "lucide-react";
import { Link } from "react-router-dom"; // at the top
export default function Chatbot() {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const startListening = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported in this browser");
    return;
  }

  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US"; // chaaho toh "hi-IN"
  recognition.interimResults = false;

  recognition.onstart = () => {
    setListening(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);   // 🎯 text input me aa jayega
  };

  recognition.onerror = () => {
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
  };

  recognition.start();
};

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! 👋 How can I help you with MoveMate today?", feedback: null, },
    
  ]);
  const [input, setInput] = useState("");
  React.useEffect(() => {
  const chatDiv = document.getElementById("chat-messages");
  if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
}, [messages]); // messages change hote hi scroll bottom

// ---------------------------------------------------------------
const sendMessage = async () => {
  if (!input.trim()) return;

  const newMessages = [
    ...messages,
    { sender: "user", text: input },
  ];
  setMessages(newMessages);

  try {
    const res = await axios.post("http://127.0.0.1:5000/chat", {
      message: input,
    });

    setMessages([
      ...newMessages,
      { sender: "bot", text: res.data.reply, feedback: null },
    ]);
  } catch (err) {
    setMessages([
      ...newMessages,
      { sender: "bot", text: "Sorry, something went wrong 😕", feedback: null },
    ]);
  }

  setInput("");
};

  const regenerate = async (botIndex) => {
  const userMsg = messages[botIndex - 1]?.text;
  if (!userMsg) return;

  try {
    const res = await axios.post("http://127.0.0.1:5000/chat", {
      message: userMsg,
    });

    const updated = [...messages];
    updated[botIndex].text = res.data.reply;
    updated[botIndex].feedback = null;
    setMessages(updated);
  } catch {
    alert("Failed to regenerate");
  }
};

  return (
    <>
      {/* Floating Chat Icon */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "46px",
          height: "46px",
          borderRadius: "12px",
          background: "linear-gradient(135deg,#6a11cb,#2575fc)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          zIndex: 1000,
        }}
      >
        <MessageSquare size={28} color="#fff" />
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "24px",
            width: "380px",
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px",
              background: "#fff",
              borderBottom: "1px solid #eee",
              fontWeight: "600",
              fontSize: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>MoveMate Assistant</span>
            <span
              onClick={() => setOpen(false)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "18px",
                color: "#888",
              }}
            >
              ×
            </span>
          </div>

          {/* Messages */}
          <div
          id="chat-messages"
            style={{
              height: "280px",
              padding: "10px",
              overflowY: "auto",
              background: "#fafafa",
            }}
          >
            {messages.map((m, i) => (
  <div
    key={i}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: m.sender === "user" ? "flex-end" : "flex-start",
      marginBottom: "12px",
    }}
  >
    {/* 🟦 MESSAGE BUBBLE */}
    <div
      style={{
        maxWidth: "75%",
        padding: "8px 12px",
        borderRadius: "12px",
        background: m.sender === "user" ? "#2575fc" : "#eaeaea",
        color: m.sender === "user" ? "#fff" : "#000",
        fontSize: "13px",
      }}
    >
      {editingIndex === i ? (
        <input
          value={editingText}
          autoFocus
          onChange={(e) => setEditingText(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const updated = [...messages];
              updated[i].text = editingText;

              if (updated[i + 1]?.sender === "bot") {
                updated[i + 1].text = "⏳ Updating response...";
              }

              setMessages(updated);
              setEditingIndex(null);
              setEditingText("");

              try {
                const res = await axios.post(
                  "http://127.0.0.1:5000/chat",
                  { message: editingText }
                );

                const finalMessages = [...updated];
                if (finalMessages[i + 1]?.sender === "bot") {
                  finalMessages[i + 1].text = res.data.reply;
                }

                setMessages(finalMessages);
              } catch {
                alert("Failed to update response");
              }
            }

            if (e.key === "Escape") {
              setEditingIndex(null);
              setEditingText("");
            }
          }}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "13px",
          }}
        />
      ) : (
        m.sender === "bot" ? (
    m.text.includes("\n") ? (
      <ul style={{ paddingLeft: "18px", margin: 0 }}>
        {m.text.split("\n").map((line, idx) => (
          <li key={idx} style={{ marginBottom: "4px", lineHeight: "1.4" }}>
            {line}
          </li>
        ))}
      </ul>
    ) : (
      <div style={{ lineHeight: "1.5" }}>{m.text}</div>
    )
  ) : (
    m.text
  )
)}
    </div>

    {/* 🔽 ICONS — bubble ke NEECHHE */}
    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
      <Copy
        size={14}
        style={{ cursor: "pointer", opacity: 0.7 }}
        onClick={() => navigator.clipboard.writeText(m.text)}
      />

      {m.sender === "user" && (
        <Pencil
          size={14}
          style={{ cursor: "pointer", opacity: 0.7 }}
          onClick={() => {
            setEditingIndex(i);
            setEditingText(m.text);
          }}
        />
      )}

      {m.sender === "bot" && i !== 0 && (
        <>
          <RotateCcw
            size={14}
            style={{ cursor: "pointer", opacity: 0.7 }}
            onClick={() => regenerate(i)}
          />
          <ThumbsUp
            size={14}
            style={{
              cursor: "pointer",
              color: m.feedback === "like" ? "#22c55e" : "#999",
            }}
            onClick={() => {
              const updated = [...messages];
              updated[i].feedback = "like";
              setMessages(updated);
            }}
          />
          <ThumbsDown
            size={14}
            style={{
              cursor: "pointer",
              color: m.feedback === "dislike" ? "#ef4444" : "#999",
            }}
            onClick={() => {
              const updated = [...messages];
              updated[i].feedback = "dislike";
              setMessages(updated);
            }}
          />
        </>
      )}
    </div>
  </div>
))}
          </div>
        


          {/* Input + Send Button + Terms */}
          <div
            style={{
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              borderTop: "1px solid #eee",
            }}
          >
            {/* Input Row */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
  {/* Text Input */}
  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask a question..."
    style={{
      flex: 1,
      padding: "8px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      outline: "none",
    }}
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />
    <button
  onClick={startListening}
  style={{
    background: listening ? "#ef4444" : "#e5e7eb",
    border: "none",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <Mic size={18} color={listening ? "#fff" : "#000"} />
</button>

  {/* Send Button */}
  <button
    onClick={sendMessage}
    style={{
      background: "#2575fc",
      border: "none",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    ➤
  </button>
</div>


            {/* Terms & Privacy */}
            <div style={{ fontSize: "10px", color: "#555", textAlign: "center" }}>
  By chatting with us you agree to our{" "}
  <Link
    to="/terms"
    style={{ color: "#2575fc", textDecoration: "underline" }}
  >
    Terms & Conditions
  </Link>{" "}
  and{" "}
  <Link
    to="/privacy"
    style={{ color: "#2575fc", textDecoration: "underline" }}
  >
    Privacy Policy
  </Link>.
</div>

            </div>
          </div>
      )}
    </>
  );
}