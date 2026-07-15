import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Trash2 } from "lucide-react";
import { apiRequest } from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Insights() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    if (saved) return JSON.parse(saved);
    return [
      {
        role: "assistant",
        content: "Hello! I am your AI Health Assistant. How can I help you today? (Note: I am an AI, not a doctor. Always consult a real doctor for medical advice.)"
      }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  function clearChat() {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I am your AI Health Assistant. How can I help you today? (Note: I am an AI, not a doctor. Always consult a real doctor for medical advice.)"
        }
      ]);
      setError("");
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setError(err.message);
      // Remove the optimistic user message if the request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', width: '100%', maxWidth: '1200px' }}>
      <div className="page-heading" style={{ alignItems: 'center' }}>
        <div>
          <p className="eyebrow">AI ASSISTANT</p>
          <h1>Health Insights</h1>
          <p className="muted">Ask questions based on your health profile and medicines.</p>
        </div>
        <button onClick={clearChat} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#ef4444' }}>
          <Trash2 size={18} />
          Clear Chat
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: '1rem' }}>{error}</p>}

      <section className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                background: msg.role === 'assistant' ? '#f3f4f6' : '#2563eb',
                color: msg.role === 'assistant' ? '#4b5563' : 'white',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div style={{
                background: msg.role === 'assistant' ? '#f9fafb' : '#3b82f6',
                color: msg.role === 'assistant' ? '#111827' : 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                maxWidth: '80%',
                lineHeight: '1.5',
                border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none'
              }}>
                {msg.role === 'assistant' ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
               <div style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.5rem', borderRadius: '50%' }}>
                  <Sparkles size={20} />
               </div>
               <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                 Thinking...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '1rem' }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health, medicines, or symptoms..."
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="primary" 
              style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>

      </section>
    </main>
  );
}
