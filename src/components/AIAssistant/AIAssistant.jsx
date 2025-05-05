import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import blackStars from '../../assets/blackStars.png'; 
// import whiteStars from '../../assets/whiteStars.png'; 
import arrowIcon from '../../assets/arrow.png';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'ME',
      text: 'please correct my code'
    },
    {
      sender: 'OUR AI',
      text: `1. LINE 9: USE N \\MOD 2 == 0 INSTEAD OF N \\MOD 2 = TRUE'.\n2. LINE 16: REPLACE FACTORIAL NUMBER WITH FACTORIAL (TOINTEGER NUMBER).\n3. LINE 17: REPLACE "FACTORIAL: " ++ FACTORIAL NUMBER WITH "FACTORIAL: " ++ SHOW (FACTORIAL (TOINTEGER NUMBER)).`
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const userMessage = { sender: 'ME', text: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      await sendToBackend(input);
      setIsLoading(false);
    }
  };

  const sendToBackend = async (query) => {
    try {
      const response = await fetch('http://localhost:5001/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'OUR AI', text: data.response }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'OUR AI', text: "⚠️ Backend-Fehler. Bitte versuche es später." }]);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <img src={blackStars} alt="Haskify Logo" className="ai-logo"/>
        <p className="ai-subheader">Ask our AI anything</p>
      </div>

      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index}>
            <div className="message-sender">
              {message.sender === 'OUR AI' && <img src={blackStars} alt="AI Logo" className="ai-logo-chat" />}
              {message.sender}
            </div>
            <div className="message-text">
              {message.text.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> 
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your projects"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <img 
          src={arrowIcon}
          alt="Send"
          className="send-icon"
          onClick={handleSend}
        />
      </div>
    </div>
  );
}