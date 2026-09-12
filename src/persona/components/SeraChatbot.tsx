import { useEffect, useRef, useState } from 'react';
import { X, Send, Sparkles, Dumbbell, Calendar, UtensilsCrossed } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SeraChatbotProps {
  stressScore: number;
  anxietyScore: number;
  depressionScore: number;
  onClose: () => void;
}

const SUGGESTIONS = [
  { icon: Dumbbell, label: 'Mind-Body Exercise', prompt: "I'm feeling really low today. Can you suggest some physical exercises or mindfulness techniques to make me feel better?" },
  { icon: Calendar, label: 'Scheduling', prompt: "I'm finding it hard to manage my time. Can you help me create a balanced daily schedule that reduces stress?" },
  { icon: UtensilsCrossed, label: 'Diet Planning', prompt: 'I want to start eating better for my mental health. Can you help me plan a simple diet for better mood and focus?' },
];

function getInitialGreeting(stressScore: number, anxietyScore: number, depressionScore: number): string {
  const depLevel = depressionScore >= 28 ? 4 : depressionScore >= 21 ? 3 : depressionScore >= 14 ? 2 : depressionScore >= 10 ? 1 : 0;
  const anxLevel = anxietyScore >= 20 ? 4 : anxietyScore >= 15 ? 3 : anxietyScore >= 10 ? 2 : anxietyScore >= 8 ? 1 : 0;
  const stressLevel = stressScore >= 34 ? 4 : stressScore >= 26 ? 3 : stressScore >= 19 ? 2 : stressScore >= 15 ? 1 : 0;
  const overall = Math.max(depLevel, anxLevel, stressLevel);

  if (overall === 0) return "Namaste! 🙏 Great job completing the assessment! Your scores look healthy. How are you feeling about your journey through the game?";
  if (overall === 1) return "Namaste! 🙏 Thank you for completing the assessment. I can see you've been experiencing some challenges lately. I'm here to listen and support you. How has your day been?";
  if (overall === 2) return "Namaste! 🙏 I appreciate you taking the time to complete this assessment. It takes courage to acknowledge when things feel difficult. Would you like to talk about what's been on your mind?";
  if (overall === 3) return "Namaste! 🙏 I can see you're going through a really tough time, and I want you to know that you're not alone. How are you holding up today?";
  return "Namaste! 🙏 Thank you for sharing your assessment with me. I'm deeply concerned about what you're experiencing, and I want you to know that you deserve support and care. Would you be open to talking about professional resources that could help? Seeking help is a sign of strength, not weakness.";
}

/**
 * Persona Health's wellness-specific SERA assistant. This talks directly to
 * the ported `supabase/functions/sera-chat` edge function (same contract as
 * the original: messages + stress/anxiety/depression scores, SSE streaming
 * back) — kept separate from the general campus concierge chat in
 * src/core/ai/aiGateway.ts because it needs assessment-severity context and
 * crisis-aware prompting the concierge assistant has no reason to carry.
 */
export default function SeraChatbot({ stressScore, anxietyScore, depressionScore, onClose }: SeraChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sera-chat`;

  useEffect(() => {
    setMessages([{ role: 'assistant', content: getInitialGreeting(stressScore, anxietyScore, depressionScore) }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages, stressScore, anxietyScore, depressionScore }),
    });
    if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;
    let assistantMessage = '';

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantMessage += content;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: 'assistant', content: assistantMessage };
              return next;
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "I apologize, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl h-[80vh] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SERA</h2>
              <p className="text-xs text-white/80">Student Emotional Resource Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSupabaseConfigured ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <p className="text-sm text-slate-400">
              This wellness chat needs a Supabase backend and the <code className="text-slate-300">sera-chat</code> edge
              function deployed. It isn't connected in this environment yet.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t border-slate-700">
              {showSuggestions && messages.length <= 1 && (
                <div className="mb-3 flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(s.prompt);
                        setShowSuggestions(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5"
                    >
                      <s.icon className="w-3.5 h-3.5" /> {s.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="btn-primary px-5 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
