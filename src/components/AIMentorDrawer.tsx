import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, MessageSquare, Lightbulb, Loader2 } from 'lucide-react';

interface AIMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIMentorDrawer: React.FC<AIMentorDrawerProps> = ({ isOpen, onClose, activeContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Quantum Computing Research Mentor. Ask me anything about quantum superposition, entanglement, Bloch spheres, Qiskit 1.x circuit programming, or how QAOA solves disaster logistics."
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sampleQuestions = [
    "Why does CNOT create entanglement between two qubits?",
    "How does QAOA's mixer Hamiltonian overcome local minima in disaster routing?",
    "What is the mathematical definition of the Bloch sphere coordinates (θ, φ)?",
    "How do I transpile circuits in modern Qiskit 1.x?",
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/quantum-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          topic: activeContext || 'Quantum Computing and QAOA Disaster Management',
        }),
      });

      const data = await response.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Connection issue: ${err.message || 'Could not contact Quantum Mentor service'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              AI Quantum Mentor
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </h3>
            <span className="text-[10px] text-slate-400">Powered by Gemini 3.8</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs leading-relaxed">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl ${
              msg.role === 'user'
                ? 'bg-cyan-600 text-white ml-6 font-medium'
                : 'bg-slate-950 border border-slate-800 text-slate-300 mr-4 whitespace-pre-wrap font-sans'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs mr-8">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            Analyzing quantum mechanics & compiling explanation...
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Recommended Prompts:
        </span>
        <div className="flex flex-col gap-1">
          {sampleQuestions.slice(0, 2).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left text-[11px] text-slate-300 hover:text-cyan-300 truncate bg-slate-900/90 hover:bg-slate-850 px-2.5 py-1 rounded border border-slate-800 transition-colors"
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about circuits, qubits, Qiskit..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
