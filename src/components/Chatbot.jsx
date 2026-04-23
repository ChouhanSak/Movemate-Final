import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, RotateCcw, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  // 🔥 Detect Role From Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setRole("customer");
        return;
      }

      // 1️⃣ Check customers collection
      let snap = await getDoc(doc(db, "customers", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setRole(data.userType || "customer");
        return;
      }

      // 2️⃣ Check agencies collection
      snap = await getDoc(doc(db, "agencies", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role || "agency");
        return;
      }

      // 3️⃣ Fallback
      setRole("customer");
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Reset Chat When Role Changes
  useEffect(() => {
    if (!role) return;

    setMessages([
      {
        sender: "bot",
        text: `Hello! 👋 How can I help you as a ${role}?`,
      },
    ]);
  }, [role]);

  // Auto scroll
  useEffect(() => {
    const chatDiv = document.getElementById("chat-messages");
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
  }, [messages]);

  // 🎤 Voice
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.start();
  };

  // 🚀 Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    try {
      const user = auth.currentUser;

      const res = await axios.post("http://127.0.0.1:5000/chat", {
        message: input,
        userId: user ? user.uid : null,
        role: role,
      });

      setMessages([
        ...newMessages,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Sorry, something went wrong 😕" },
      ]);
    }

    setInput("");
  };

  // 🔄 Regenerate
  const regenerate = async (botIndex) => {
    const userMsg = messages[botIndex - 1]?.text;
    if (!userMsg) return;

    try {
      const user = auth.currentUser;

      const res = await axios.post("http://127.0.0.1:5000/chat", {
        message: userMsg,
        userId: user ? user.uid : null,
        role: role,
      });

      const updated = [...messages];
      updated[botIndex].text = res.data.reply;
      setMessages(updated);
    } catch {
      alert("Failed to regenerate");
    }
  };

  return (
    <>
      {/* Chat Icon */}
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
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <MessageSquare size={26} />
      </div>

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
              borderBottom: "1px solid #eee",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            MoveMate Assistant ({role})
            <span style={{ cursor: "pointer" }} onClick={() => setOpen(false)}>×</span>
          </div>

          {/* Messages */}
          <div
            id="chat-messages"
            style={{ height: "280px", padding: "10px", overflowY: "auto", background: "#fafafa" }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: "10px", textAlign: m.sender === "user" ? "right" : "left" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    background: m.sender === "user" ? "#2575fc" : "#eaeaea",
                    color: m.sender === "user" ? "#fff" : "#000",
                    maxWidth: "75%",
                    fontSize: "13px",
                  }}
                >
                  {m.text}
                </div>

                {m.sender === "bot" && i !== 0 && (
                  <div style={{ marginTop: "4px" }}>
                    <RotateCcw size={14} style={{ cursor: "pointer" }} onClick={() => regenerate(i)} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px", borderTop: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask a question..."
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />

              <button onClick={startListening} style={{ border: "none", background: "#eee", borderRadius: "50%", padding: "8px" }}>
                <Mic size={16} />
              </button>

              <button onClick={sendMessage} style={{ background: "#2575fc", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px" }}>
                ➤
              </button>
            </div>

            <div style={{ fontSize: "10px", textAlign: "center", marginTop: "6px" }}>
              By chatting you agree to our <Link to="/terms">Terms</Link> & <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}