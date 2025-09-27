import React, { useState } from 'react';
import PostsList from './PostsList';
import CreatePost from './CreatePost';

const PostsPage = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostCreated = (newPost) => {
    setRefreshPosts(prev => prev + 1);
    setShowCreatePost(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PostsList 
          onCreatePost={() => setShowCreatePost(true)}
          key={refreshPosts}
        />
        
        <CreatePost
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </div>
  );
};

export default PostsPage;