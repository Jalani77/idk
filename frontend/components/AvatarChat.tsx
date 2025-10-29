import { useEffect, useRef, useState } from 'react';
import { sendMessage } from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; ts: number; }

export default function AvatarChat({ onProfileUpdated }: { onProfileUpdated?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m Yiri, your AI consultant. Tell me about your business.', ts: Date.now() }
  ]);
  const [input, setInput] = useState('We are a services agency of 3-10 people.');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function submit() {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    const res = await sendMessage(input);
    setMessages((m) => [...m, { role: 'assistant', content: res.reply, ts: Date.now() }]);
    if (res.done && onProfileUpdated) onProfileUpdated();
  }

  return (
    <div className="chat">
      <div className="avatar">
        <img src="/avatar.svg" alt="Yiri Avatar" />
      </div>
      <div className="messages" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.content}</div>
        ))}
      </div>
      <div className="composer">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here..." onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <button className="btn" onClick={submit}>Send</button>
      </div>
      <div className="muted">
        We\'ll ask 7 quick questions: industry, size, revenue, team, tools, workflows, goals.
      </div>
    </div>
  );
}
