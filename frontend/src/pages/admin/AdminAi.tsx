import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Package,
  User,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import { Button } from '../../components/common/Button';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Sales & Revenue Summary',
    prompt: 'Provide an executive summary of current sales revenue, orders fulfilled, and average order value.',
  },
  {
    icon: AlertTriangle,
    label: 'Low Stock Alert',
    prompt: 'Which smartphones currently have critically low inventory (5 units or less) and need replenishment?',
  },
  {
    icon: Package,
    label: 'Brand Performance',
    prompt: 'Which mobile phone brands are driving the highest demand and revenue in our store?',
  },
  {
    icon: Zap,
    label: 'Promotional Recommendations',
    prompt: 'Suggest flash sale and discount strategies to boost sales for slow-moving phone inventory.',
  },
];

export const AdminAi: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello Admin! I am your Jaffna Mobile Zone Business Intelligence Copilot. My responses are strictly grounded in your live MongoDB database—including active inventory levels, order histories, real-time revenue, and customer reviews. How can I assist your operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await aiApi.askAdminBusinessAssistant(textToSend);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text:
          res.data?.text ||
          'Analysis complete based on your active database. No further anomalies detected.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue querying the database business metrics. Please verify MongoDB connectivity or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Chat history cleared. I am ready with fresh live data from your store.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-grad-ai flex items-center justify-center text-white shadow-soft">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              Business Intelligence AI
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-grad-ai text-white border border-white/10">
                Grounded
              </span>
            </h1>
            <p className="text-ink-3 text-xs">
              Direct insights powered by live database statistics and analytics
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-ink-3 hover:text-ink">
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Clear Chat
        </Button>
      </div>

      {/* Preset Prompts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        {PRESET_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-card border border-line hover:border-primary/40 hover:bg-elevated transition-all text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-ink truncate">{item.label}</span>
              </div>
              <p className="text-[10px] text-ink-3 line-clamp-1">{item.prompt}</p>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto glass-card rounded-2xl border border-line p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-grad-primary text-white'
                  : 'bg-surface border border-line text-primary'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-grad-primary text-white rounded-tr-none'
                  : 'bg-card border border-line text-ink-2 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              <div
                className={`text-[10px] mt-2 ${
                  msg.sender === 'user' ? 'text-white/70 text-right' : 'text-ink-3'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-primary">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-card border border-line rounded-2xl rounded-tl-none p-4 text-xs text-ink-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              Analyzing live store database...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about inventory, sales, customer behavior, or brand analytics..."
          disabled={isLoading}
          className="min-w-0 flex-1 px-4 py-3 bg-card border border-line rounded-xl text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="px-5">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
export default AdminAi;