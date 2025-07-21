import React, { useState, useEffect, useRef } from 'react';
import './AIAssistant.css';
import blackStars from '../../assets/blackStars.png';
import arrowIcon from '../../assets/arrow.png';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AIAssistant({ sharedState, updateSharedState }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const sessionHistoryRef = useRef([]);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    const initialMessage = "Hi! How can I help you with your Haskell project today?";
    let currentIndex = 0;
    
    setIsTyping(true);
    setMessages([{ sender: 'OUR AI', text: '', isTyping: true }]);
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < initialMessage.length) {
        setMessages(prev => [
          { 
            sender: 'OUR AI', 
            text: initialMessage.substring(0, currentIndex + 1),
            isTyping: true 
          }
        ]);
        currentIndex++;
      } else {
        clearInterval(typingIntervalRef.current);
        setMessages(prev => [
          { 
            sender: 'OUR AI', 
            text: initialMessage,
            isTyping: false 
          }
        ]);
        setIsTyping(false);
        sessionHistoryRef.current.push({
          question: null,
          response: initialMessage,
          time: new Date().toISOString()
        });
      }
    }, 15);

    return () => clearInterval(typingIntervalRef.current);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (sessionHistoryRef.current.length > 0) {
        console.log('Auto-saving session:', sessionHistoryRef.current);
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const payload = JSON.stringify({ session: sessionHistoryRef.current });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE}/api/save-session`, blob);
      } else {
        console.log('No session history to save.');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSend = async () => {
    if (input.trim() && !isLoading && !isTyping) {
      setIsLoading(true);
      const userMessage = { sender: 'ME', text: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      setMessages(prev => [...prev, { 
        sender: 'OUR AI', 
        text: '', 
        isLoading: true 
      }]);
      
      sessionHistoryRef.current.push({
        question: input,
        response: null,
        time: new Date().toISOString()
      });
      await sendToBackend(input);
      setIsLoading(false);
    }
  };

  const sendToBackend = async (query) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await fetch(`${API_BASE}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          code: sharedState.code,
          output: sharedState.output
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      setIsTyping(true);
      let currentIndex = 0;
      const responseText = data.response;
      
      setMessages(prev => [...prev, { 
        sender: 'OUR AI', 
        text: '', 
        isTyping: true 
      }]);
      
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < responseText.length) {
          setMessages(prev => {
            const base = prev.slice(0, -1);
            return [
              ...base,
              { 
                sender: 'OUR AI', 
                text: responseText.substring(0, currentIndex + 1),
                isTyping: true 
              }
            ];
          });
          currentIndex++;
        } else {
          clearInterval(typingIntervalRef.current);
          setMessages(prev => {
            const base = prev.slice(0, -1);
            return [
              ...base,
              { 
                sender: 'OUR AI', 
                text: responseText,
                isTyping: false 
              }
            ];
          });
          setIsTyping(false);
          const last = sessionHistoryRef.current[sessionHistoryRef.current.length - 1];
          if (last && last.response === null) {
            last.response = responseText;
          }

          const payload = { session: sessionHistoryRef.current };

          if (!sessionIdRef.current) {
            fetch(`${API_BASE}/api/save-session`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.id) {
                  sessionIdRef.current = data.id;
                }
              });
          } else {
            fetch(`${API_BASE}/api/save-session/${sessionIdRef.current}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }
      }, 15);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, { 
          sender: 'OUR AI', 
          text: "⚠️ Error connecting to AI. Please try again later.",
          isTyping: false
        }];
      });
      setIsLoading(false);
      setIsTyping(false);
      const last = sessionHistoryRef.current[sessionHistoryRef.current.length - 1];
      if (last && last.response === null) {
        last.response = "⚠️ Error connecting to AI. Please try again later.";
      }
    }
  };

  const applyCodeChange = (newCode) => {
    updateSharedState({ 
      code: newCode,
      changedLines: [] 
    });
  };

  const formatMessage = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.replace(/```(\w+)?\n?|\n?```/g, '').trim();
        const language = part.match(/```(\w+)/)?.[1] || 'text';
        
        return (
          <div key={i} className="code-block-container">
            <SyntaxHighlighter
              language={language}
              style={tomorrow}
              customStyle={{
                background: '#282c34',
                borderRadius: '6px',
                padding: '12px',
                margin: '8px 0',
                fontSize: '0.8em', 
                maxHeight: '300px', 
                overflow: 'auto' 
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {code}
            </SyntaxHighlighter>
            {language === 'haskell' && (
              <button 
                className="apply-code-button"
                onClick={() => applyCodeChange(code)}
              >
                Apply Code
              </button>
            )}
          </div>
        );
      }
      return (
        <div key={i}>
          {part.split('\n').map((line, j) => (
            <div key={j}>{line}</div>
          ))}
        </div>
      );
    });
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
              {message.sender === 'OUR AI' && (
                <>
                  <img src={blackStars} alt="AI Logo" className="ai-logo-chat"/>
                  {message.sender}
                  {message.isLoading && <span className="loading-indicator"></span>}
                </>
              )}
              {message.sender === 'ME' && message.sender}
            </div>
            <div className="message-text">
              {formatMessage(message.text)}
              {message.isTyping && !message.isLoading && (
                <span className="typing-cursor">|</span>
              )}
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
          disabled={isLoading || isTyping}
        />
        <img 
          src={arrowIcon}
          alt="Send"
          className="send-icon"
          onClick={handleSend}
          style={{ 
            opacity: (isLoading || isTyping) ? 0.5 : 1,
            cursor: (isLoading || isTyping) ? 'not-allowed' : 'pointer' 
          }}
        />
      </div>
    </div>
  );
}