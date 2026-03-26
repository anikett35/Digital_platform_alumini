import React, { useState, useEffect } from 'react';
import { communitiesAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { Hash, Users, ArrowUp, Send, MessageSquare, Plus, X, ChevronLeft, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const POST_TYPES = ['question','resource','news','experience','opportunity'];
const TYPE_COLORS = {
  question:'badge-blue', resource:'badge-green', news:'badge-amber',
  experience:'badge-violet', opportunity:'badge-red'
};

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [posts,       setPosts]       = useState([]);
  const [newPost,     setNewPost]     = useState({ title:'', content:'', type:'question' });
  const [showForm,    setShowForm]    = useState(false);
  const [comment,     setComment]     = useState({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    communitiesAPI.getCommunities()
      .then(r => setCommunities(r.data))
      .catch(() => toast.error('Failed to load communities'))
      .finally(() => setLoading(false));
  }, []);

  const selectCommunity = async (c) => {
    setSelected(c); setShowForm(false);
    try {
      const r = await communitiesAPI.getPosts(c._id);
      setPosts(r.data);
    } catch { toast.error('Failed to load posts'); }
  };

  const joinLeave = async (id) => {
    try {
      const r = await communitiesAPI.joinLeave(id);
      setCommunities(prev => prev.map(c => c._id === id ? { ...c, isJoined: r.data.joined, memberCount: r.data.memberCount } : c));
      if (selected?._id === id) setSelected(s => ({ ...s, isJoined: r.data.joined, memberCount: r.data.memberCount }));
    } catch { toast.error('Failed'); }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      const r = await communitiesAPI.createPost(selected._id, newPost);
      setPosts(p => [r.data, ...p]);
      setNewPost({ title:'', content:'', type:'question' });
      setShowForm(false);
      toast.success('Post created!');
    } catch { toast.error('Failed to post'); }
  };

  const upvote = async (pid) => {
    try {
      const r = await communitiesAPI.upvotePost(pid);
      setPosts(prev => prev.map(p => p._id === pid ? { ...p, upvotes: Array(r.data.upvotes).fill('') } : p));
    } catch { toast.error('Failed'); }
  };

  const addComment = async (pid) => {
    const c = comment[pid]?.trim();
    if (!c) return;
    try {
      await communitiesAPI.commentPost(pid, c);
      setComment(prev => ({ ...prev, [pid]: '' }));
      const r = await communitiesAPI.getPosts(selected._id);
      setPosts(r.data);
    } catch { toast.error('Failed'); }
  };

  const deletePost = async (pid) => {
    try {
      await communitiesAPI.deletePost(pid);
      setPosts(prev => prev.filter(p => p._id !== pid));
      toast.success('Post deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!selected ? (
        // Communities list
        <div className="space-y-6">
          <div className="page-header">
            <div className="flex items-center gap-2 mb-1"><Hash className="w-5 h-5" /><h1 className="text-xl font-bold">Communities</h1></div>
            <p className="text-violet-100 text-sm">Join department communities and engage with peers</p>
          </div>
          {communities.length === 0 ? (
            <div className="card p-16 text-center"><Hash className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-500">No communities yet</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {communities.map(c => (
                <div key={c._id} className="card-hover p-5 flex flex-col gap-3" onClick={() => selectCommunity(c)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: c.color + '22', color: c.color }}>
                        {c.icon || '🎓'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{c.name}</h3>
                        <p className="text-xs text-gray-500">{c.department}</p>
                      </div>
                    </div>
                    {c.isJoined && <span className="badge-green shrink-0 text-xs">Joined</span>}
                  </div>
                  {c.description && <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.memberCount} members</span>
                    <button onClick={e => { e.stopPropagation(); joinLeave(c._id); }}
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${c.isJoined ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
                      {c.isJoined ? 'Leave' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Community posts view
        <div className="space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelected(null); setPosts([]); }} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="font-display font-bold text-gray-900">{selected.name}</h2>
              <p className="text-sm text-gray-500">{selected.memberCount} members · {selected.department}</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" />{showForm ? 'Cancel' : 'Post'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={submitPost} className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-900">Create Post</h3>
              <input value={newPost.title} onChange={e => setNewPost(n => ({...n, title: e.target.value}))} className="input" placeholder="Post title…" required />
              <textarea value={newPost.content} onChange={e => setNewPost(n => ({...n, content: e.target.value}))} className="input resize-none" rows={3} placeholder="Share something…" required />
              <div className="flex items-center justify-between gap-3">
                <select value={newPost.type} onChange={e => setNewPost(n => ({...n, type: e.target.value}))} className="input w-auto capitalize">
                  {POST_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
                <button type="submit" className="btn-primary"><Send className="w-4 h-4" />Publish</button>
              </div>
            </form>
          )}

          {posts.length === 0 ? (
            <div className="card p-12 text-center"><MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-500">No posts yet. Be the first!</p></div>
          ) : posts.map(p => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 avatar text-sm shrink-0">{p.author?.name?.charAt(0) || '?'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{p.author?.name}</p>
                    {(p.author?._id === user?.id || user?.role === 'admin') && (
                      <button onClick={() => deletePost(p._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{p.author?.currentPosition}</p>
                </div>
              </div>
              <span className={`${TYPE_COLORS[p.type] || 'badge-gray'} mb-2 inline-block`}>{p.type}</span>
              <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.content}</p>
              {p.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">{p.tags.map((t,i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{t}</span>)}</div>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <button onClick={() => upvote(p._id)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 transition-all font-medium">
                  <ArrowUp className="w-4 h-4" />{p.upvotes?.length || 0}
                </button>
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><MessageSquare className="w-4 h-4" />{p.comments?.length || 0}</span>
              </div>
              {p.comments?.length > 0 && (
                <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                  {p.comments.slice(-3).map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-6 h-6 avatar text-xs shrink-0">{c.author?.name?.charAt(0) || '?'}</div>
                      <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-900">{c.author?.name}</p>
                        <p className="text-xs text-gray-700 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <input value={comment[p._id] || ''} onChange={e => setComment(prev => ({...prev, [p._id]: e.target.value}))}
                  className="input text-sm py-2 flex-1" placeholder="Write a comment…" onKeyDown={e => e.key === 'Enter' && addComment(p._id)} />
                <button onClick={() => addComment(p._id)} className="btn-primary py-2 px-3 text-xs"><Send className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
