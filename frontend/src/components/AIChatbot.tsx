import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faSpinner, faTimes, faCommentDots, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIChatbotProps {
  appId: number;
}

const API_URL = 'http://127.0.0.1:8000/api';

const AIChatbot: React.FC<AIChatbotProps> = ({ appId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: '¡Hola! Soy el asistente de IA. ¿Tienes alguna duda técnica sobre esta aplicación o su código?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '45px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [input]);

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'es-ES';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user?.id || 0, pregunta: userMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'bot', text: data.respuesta }]);
      } else {
        setMessages((prev) => [...prev, { role: 'bot', text: 'Error: No pude conectar con la IA.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Error de conexión.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: 'var(--primary)', color: 'white', border: 'none',
          borderRadius: '50%', width: '60px', height: '60px',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', zIndex: 1000, transition: 'transform 0.2s'
        }}
      >
        <FontAwesomeIcon icon={faCommentDots} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      width: '450px', height: '650px', background: 'var(--surface)',
      borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.3)',
      display: 'flex', flexDirection: 'column',
      zIndex: 1000, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient)', padding: '16px', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <FontAwesomeIcon icon={faRobot} />
          Asistente de App (RAG)
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
        background: 'var(--bg-color)' // Evita que se vea transparente
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '90%', padding: '12px 18px', borderRadius: '16px',
            background: m.role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'var(--surface)',
            color: m.role === 'user' ? 'white' : 'var(--text-primary)',
            border: m.role === 'bot' ? '1px solid rgba(139,92,246,0.2)' : 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            fontSize: '0.95rem', lineHeight: 1.5,
            borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
            borderBottomLeftRadius: m.role === 'bot' ? '4px' : '16px',
          }}>
            {m.role === 'bot' && <div style={{ marginBottom: '8px', color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FontAwesomeIcon icon={faRobot} /> Asistente RAG</div>}
            {m.role === 'bot' ? (
              <div className="markdown-reader" style={{ padding: 0 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
              </div>
            ) : (
              m.text
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <FontAwesomeIcon icon={faSpinner} spin /> Pensando...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: '16px', borderTop: '1px solid rgba(139,92,246,0.2)', display: 'flex', gap: '10px', background: 'var(--surface)', alignItems: 'flex-end'
      }}>
        <textarea 
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !loading) {
                sendMessage(e as any);
              }
            }
          }}
          placeholder="Escribe tu pregunta..."
          rows={1}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '16px',
            border: '1px solid var(--border-color)', background: 'var(--bg-color)',
            color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem',
            resize: 'none', overflowY: 'auto', fontFamily: 'inherit', lineHeight: '1.4',
            height: '45px', maxHeight: '120px'
          }}
        />
        <button type="button" onClick={toggleListen} style={{
          background: isListening ? 'var(--danger)' : 'rgba(255, 255, 255, 0.05)', color: isListening ? 'white' : 'var(--text-secondary)',
          border: '1px solid var(--border-color)', borderRadius: '50%',
          width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
        }}>
          <FontAwesomeIcon icon={faMicrophone} className={isListening ? 'pulse-animation' : ''} />
        </button>
        <button type="submit" disabled={loading || !input.trim()} style={{
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', border: 'none', borderRadius: '50%',
          width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !input.trim()) ? 0.7 : 1,
          boxShadow: '0 4px 10px rgba(139,92,246,0.3)'
        }}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
