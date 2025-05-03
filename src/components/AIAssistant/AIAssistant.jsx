import React, { useState } from 'react';
import './AIAssistant.css';
import blackStars from '../../assets/blackStars.png'; 
import whiteStars from '../../assets/whiteStars.png'; 


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

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'ME', text: input }]);
      setInput('');
    }
  };

  return (
    <>
     <div className="ai-assistant">
        <div className="ai-header">
            <img 
                src={blackStars} 
                alt="Haskify Logo" 
                className="ai-logo"
            />
        <p className="ai-subheader">Ask our AI anything</p>
        </div>

      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender.toLowerCase().replace(' ', '-')}`}>
            <div className="message-sender">
              {message.sender === 'OUR AI' && <img src={whiteStars} alt="AI Logo" className="ai-logo" />}
              {message.sender}
            </div>
            <div className="message-text">
              {message.text.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your projects"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Submit</button>
      </div>
    </div>
    </>
  );
}