import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from:'bot', text:'Hi! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const send = e => {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    setMsgs(m => [...m, { from:'user', text: question }]);
    setInput('');
    setTimeout(() => {
      setMsgs(m => [...m, { from:'bot', text: 'Thanks for your message! Please browse our platform or contact an admin for specific help.' }]);
    }, 800);
  };
  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-modal border border-gray-100 flex flex-col overflow-hidden" style={{height:'380px'}}>
          <div className="p-4 bg-violet-600 text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div><p className="font-bold text-sm">AlumniConnect Help</p><p className="text-xs text-violet-200">Ask me anything</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.from==='user'?'bg-violet-600 text-white':'bg-gray-100 text-gray-800'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} className="input text-sm py-2 flex-1" placeholder="Type a message…" />
            <button type="submit" className="btn-primary p-2 px-3"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
