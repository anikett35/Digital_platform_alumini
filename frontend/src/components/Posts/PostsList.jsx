import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  User,
  Building,
  GraduationCap,
  Filter,
  Search,
  Trash2,
  Edit
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  useEffect(() => {
    // Check if current user liked this post
    const userLiked = post.likes?.some(like => like.user === user?.id);
    setIsLiked(userLiked);
  }, [post.likes, user?.id]);

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-500',
      career: 'bg-blue-500',
      networking: 'bg-green-500',
      advice: 'bg-purple-500',
      opportunities: 'bg-orange-500',
      events: 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/posts/${post._id}/like`);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/posts/${post._id}/comments`, {
        text: newComment
      });
      
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
      alert('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`/api/posts/${post._id}`);
      onDelete(post._id);
      alert('Post deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Author Info */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author?.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="capitalize">{post.author?.role}</span>
                {post.author?.role === 'alumni' && post.author?.currentCompany && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{post.author.currentCompany}</span>
                    </div>
                  </>
                )}
                {post.author?.graduationYear && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>{post.author.graduationYear}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {formatTimeAgo(post.createdAt)}
            </div>
            
            {/* Add delete button for post author or admin */}
            {(user?.id === post.author?._id || user?.role === 'admin') && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{post.title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PostsList = ({ onCreatePost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });
  const { user } = useAuth();

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'career', label: 'Career' },
    { value: 'networking', label: 'Networking' },
    { value: 'advice', label: 'Advice' },
    { value: 'opportunities', label: 'Opportunities' },
    { value: 'events', label: 'Events' },
    { value: 'general', label: 'General' }
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/posts', {
        params: {
          category: filters.category === 'all' ? undefined : filters.category,
          page: 1,
          limit: 20
        }
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Fetch posts error:', error);
      alert('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters.category]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post._id !== deletedPostId));
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    post.content.toLowerCase().includes(filters.search.toLowerCase()) ||
    post.author.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Posts</h1>
        {user?.role === 'alumni' && (
          <button
            onClick={onCreatePost}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Post
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={() => {}}
              onComment={() => {}}
              onDelete={handlePostDelete}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4">
              {user?.role === 'alumni' 
                ? "Be the first to share something with the community!"
                : "Check back later for posts from our alumni community."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;