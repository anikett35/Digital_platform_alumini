import React, { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Heart, MessageCircle, Plus, Trash2, Send, RefreshCw, FileText, Loader } from 'lucide-react';

function CreatePostForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Fill in title and content'); return; }
    setLoading(true);
    try {
      await postsAPI.createPost(form);
      toast.success('Post published!');
      setForm({ title: '', content: '', category: 'general' });
      onCreated();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-5">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-violet-600" />Create Post</h3>
      <form onSubmit={submit} className="space-y-3">
        <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input" placeholder="Post title…" required />
        <textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} className="input resize-none" rows={3} placeholder="Share something with the community…" required />
        <div className="flex items-center justify-between gap-3">
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input w-auto">
            {['general','career','networking','advice','opportunities','events'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Posting…' : <><Send className="w-4 h-4" />Publish</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function PostCard({ post, currentUserId, onDelete, onLike, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const isLiked = post.likes?.includes(currentUserId);

  const submitComment = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onComment(post._id, commentText);
    setCommentText('');
  };

  const CAT_COLORS = { career:'badge-blue', networking:'badge-violet', advice:'badge-amber', opportunities:'badge-green', events:'badge-red', general:'badge-gray' };

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 avatar text-sm shrink-0">{post.author?.name?.charAt(0) || '?'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-gray-900 text-sm">{post.author?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{post.author?.currentPosition} {post.author?.currentCompany ? `@ ${post.author.currentCompany}` : ''}</p>
            </div>
            {post.author?._id === currentUserId && (
              <button onClick={() => onDelete(post._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {post.category && <span className={`${CAT_COLORS[post.category] || 'badge-gray'} mb-3 inline-block`}>{post.category}</span>}
      <h3 className="font-bold text-gray-900 mb-1.5">{post.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{post.content}</p>

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
          {post.likes?.length || 0}
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-violet-600 transition-all">
          <MessageCircle className="w-4 h-4" />
          {post.comments?.length || 0} Comments
        </button>
        <span className="ml-auto text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {post.comments?.map((c, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <div className="w-7 h-7 avatar text-xs shrink-0">{c.author?.name?.charAt(0) || '?'}</div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <p className="font-semibold text-xs text-gray-900">{c.author?.name}</p>
                <p className="text-xs text-gray-700 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex gap-2 mt-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              className="input text-sm py-2 flex-1" placeholder="Write a comment…" />
            <button type="submit" className="btn-primary py-2 px-4 text-xs">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function PostsList() {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const canCreate = user?.role === 'alumni' || user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postsAPI.getAllPosts();
      setPosts(Array.isArray(res.data) ? res.data : (res.data.posts || []));
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deletePost = async id => {
    try { await postsAPI.deletePost(id); toast.success('Post deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const likePost = async id => {
    try { await postsAPI.likePost(id); load(); }
    catch { toast.error('Failed'); }
  };

  const comment = async (id, text) => {
    try { await postsAPI.addComment(id, { text }); load(); }
    catch { toast.error('Failed to comment'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Community Feed</h2>
        <button onClick={load} className="btn-secondary p-2"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {canCreate && <CreatePostForm onCreated={load} />}
      {loading ? (
        <div className="flex justify-center py-10"><Loader className="w-7 h-7 text-violet-600 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center"><FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-500">No posts yet</p></div>
      ) : posts.map(p => (
        <PostCard key={p._id} post={p} currentUserId={user?.id} onDelete={deletePost} onLike={likePost} onComment={comment} />
      ))}
    </div>
  );
}
