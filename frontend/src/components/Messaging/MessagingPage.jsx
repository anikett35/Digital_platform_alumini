import React, { useState, useEffect, useRef, useCallback } from 'react';
import { messagesAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Send, Search, MessageSquare, Plus, X, ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

export default function MessagingPage() {
  const { user, token } = useAuth();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]); // always array
  const [contacts,      setContacts]      = useState([]); // always array
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]); // always array
  const [text,          setText]          = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [search,        setSearch]        = useState('');
  const [showNewChat,   setShowNewChat]   = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [mobileView,    setMobileView]    = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);
  const socketRef      = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ─── Socket.IO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join', user?.id));
    socket.on('newMessage', ({ message }) => {
      // backend emits { message, conversationId }
      if (!message) return;
      setMessages(prev =>
        prev.find(m => m._id === message._id) ? prev : [...prev, message]
      );
      scrollToBottom();
      loadConversations();
    });
    return () => socket.disconnect();
  }, [token, user?.id]); // eslint-disable-line

  // ─── Data loaders ──────────────────────────────────────────────────────────
  // Backend returns: { conversations: [...] }
  const loadConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations();
      // Safely extract array regardless of shape
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.conversations ?? []);
      setConversations(list);
    } catch (err) {
      console.error('loadConversations error:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  // Backend returns: { users: [...] }
  const loadContacts = useCallback(async () => {
    try {
      const res = await messagesAPI.getContacts();
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.users ?? []);
      setContacts(list);
    } catch (err) {
      console.error('loadContacts error:', err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadContacts();
  }, [loadConversations, loadContacts]);

  // ─── Open conversation & load messages ─────────────────────────────────────
  // Backend returns: { messages: [...], conversationId }
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMobileView('chat');
    setLoadingMsgs(true);
    try {
      const res = await messagesAPI.getMessages(conv._id);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.messages ?? []);
      setMessages(list);
      await messagesAPI.markAsRead(conv._id).catch(() => {});
    } catch (err) {
      toast.error('Failed to load messages');
      console.error(err);
    } finally {
      setLoadingMsgs(false);
      setTimeout(scrollToBottom, 80);
    }
  };

  // ─── Start a new conversation ───────────────────────────────────────────────
  // Backend returns: { conversation: {...}, message, isExisting }
  const startConversation = async (contactId) => {
    try {
      const res = await messagesAPI.createConversation({ participantId: contactId });
      const data = res.data;
      // Response wraps in { conversation: {...} }
      const conv = data?.conversation ?? data;
      setShowNewChat(false);
      setContactSearch('');
      await loadConversations();
      if (conv?._id) await openConversation(conv);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  // ─── Send message ───────────────────────────────────────────────────────────
  // Backend returns: { message: messageObject }
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await messagesAPI.sendMessage(activeConv._id, { content: text.trim() });
      const data = res.data;
      // Backend wraps in { message: {...} }
      const msg = data?.message ?? data;
      if (msg?._id || msg?.content) {
        setMessages(prev => [...prev, msg]);
      }
      setText('');
      setTimeout(scrollToBottom, 50);
      loadConversations();
    } catch (err) {
      toast.error('Failed to send message');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  // Backend pre-computes `participant` (the other user) on each conversation
  const getOther = (conv) =>
    conv?.participant || conv?.otherParticipants?.[0] ||
    conv?.participants?.find(p => (p._id || p) !== user?.id);

  // Filter conversations by search text
  const filteredConvs = Array.isArray(conversations)
    ? conversations.filter(c => {
        const name = getOther(c)?.name || '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : [];

  // Filter contacts by search text
  const filteredContacts = Array.isArray(contacts)
    ? contacts.filter(c =>
        c.name?.toLowerCase().includes(contactSearch.toLowerCase())
      )
    : [];

  const formatTime = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d);
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex bg-gray-50 overflow-hidden flex-1" style={{ minHeight: 0 }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`
        ${mobileView === 'chat' ? 'hidden' : 'flex'}
        md:flex w-full md:w-80 lg:w-96
        flex-col bg-white border-r border-gray-100 shrink-0
        overflow-hidden
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-gray-900 text-lg">Messages</h2>
            <div className="flex items-center gap-1">
              <button onClick={loadConversations} title="Refresh"
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setShowNewChat(v => !v)} title="New conversation"
                className="p-2 rounded-xl hover:bg-violet-50 text-violet-600 transition-all">
                {showNewChat ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm py-2" placeholder="Search conversations…" />
          </div>
        </div>

        {/* New Chat Panel */}
        {showNewChat && (
          <div className="p-3 border-b border-gray-100 bg-violet-50 shrink-0">
            <p className="text-xs font-bold text-violet-800 mb-2">Start New Conversation</p>
            <input value={contactSearch} onChange={e => setContactSearch(e.target.value)}
              className="input text-sm py-2 mb-2" placeholder="Search people by name…" autoFocus />
            <div className="max-h-36 overflow-y-auto space-y-0.5">
              {filteredContacts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">
                  {contactSearch ? 'No results' : 'Type a name to search…'}
                </p>
              ) : filteredContacts.slice(0, 8).map(c => (
                <button key={c._id} onClick={() => startConversation(c._id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white transition-all text-left">
                  <div className="w-8 h-8 avatar text-xs shrink-0">{c.name?.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate capitalize">{c.role} · {c.department}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loadingConvs ? (
            <div className="flex justify-center py-10">
              <Loader className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1">Click + to start a new chat</p>
            </div>
          ) : filteredConvs.map(conv => {
            const other = getOther(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => openConversation(conv)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 text-left
                  transition-all border-b border-gray-50
                  ${isActive
                    ? 'bg-violet-50 border-l-2 border-l-violet-500'
                    : 'hover:bg-gray-50'}
                `}>
                <div className="w-11 h-11 avatar text-sm shrink-0">
                  {other?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`font-semibold text-sm truncate ${isActive ? 'text-violet-700' : 'text-gray-900'}`}>
                      {other?.name || 'Unknown'}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatTime(conv.lastMessage?.createdAt || conv.lastActivity)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5 capitalize">
                    {other?.role} · {other?.department}
                  </p>
                  {conv.lastMessage?.content && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Chat Area ───────────────────────────────────────────────────────── */}
      <main className={`
        ${mobileView === 'list' ? 'hidden' : 'flex'}
        md:flex flex-1 flex-col min-w-0 bg-gray-50 overflow-hidden
      `}>
        {!activeConv ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Your messages</h3>
              <p className="text-gray-500 text-sm mb-4">
                Select a conversation or start a new one
              </p>
              <button onClick={() => setShowNewChat(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> New Conversation
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 sm:px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0 shadow-sm">
              <button onClick={() => { setMobileView('list'); setActiveConv(null); }}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              {(() => {
                const other = getOther(activeConv);
                return (
                  <>
                    <div className="w-10 h-10 avatar text-sm shrink-0">
                      {other?.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{other?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {other?.role} · {other?.department}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-5 space-y-3">
              {loadingMsgs ? (
                <div className="flex justify-center py-10">
                  <Loader className="w-6 h-6 text-violet-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                </div>
              ) : messages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender;
                const isMe = senderId === user?.id;
                return (
                  <div key={msg._id || i}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                    {!isMe && (
                      <div className="w-7 h-7 avatar text-xs shrink-0 mb-0.5">
                        {(msg.sender?.name || '?').charAt(0)}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%] sm:max-w-[60%]`}>
                      <div className={`
                        px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                        ${isMe
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'}
                      `}>
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage}
              className="p-3 sm:px-5 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0">
              <input value={text} onChange={e => setText(e.target.value)}
                className="input flex-1 py-2.5 text-sm" placeholder="Type a message…" />
              <button type="submit" disabled={sending || !text.trim()}
                className="btn-primary px-4 py-2.5 shrink-0 disabled:opacity-50">
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}