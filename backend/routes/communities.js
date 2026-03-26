const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const CommunityPost = require('../models/CommunityPost');
const { auth } = require('../middleware/auth');

// GET /api/communities — list all communities
router.get('/', auth, async (req, res) => {
  try {
    const communities = await Community.find()
      .select('name department college description icon color members')
      .lean();
    const result = communities.map(c => ({
      ...c,
      memberCount: c.members.length,
      isJoined: c.members.map(String).includes(req.user.id)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/communities — create community (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { name, department, college, description, icon, color } = req.body;
    const community = await Community.create({ name, department, college, description, icon, color });
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/communities/:id/join-leave — toggle membership
router.post('/:id/join-leave', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const idx = community.members.map(String).indexOf(req.user.id);
    if (idx === -1) {
      community.members.push(req.user.id);
    } else {
      community.members.splice(idx, 1);
    }
    await community.save();
    res.json({ joined: idx === -1, memberCount: community.members.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/communities/:id/posts — get posts for a community
router.get('/:id/posts', auth, async (req, res) => {
  try {
    const posts = await CommunityPost.find({ community: req.params.id })
      .populate('author', 'name profileImage department currentPosition')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/communities/:id/posts — create post
router.post('/:id/posts', auth, async (req, res) => {
  try {
    const { title, content, type, tags } = req.body;
    const post = await CommunityPost.create({
      community: req.params.id,
      author: req.user.id,
      title, content, type, tags
    });
    const populated = await post.populate('author', 'name profileImage department currentPosition');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/communities/posts/:pid/upvote — toggle upvote
router.post('/posts/:pid/upvote', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.pid);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.upvotes.map(String).indexOf(req.user.id);
    if (idx === -1) post.upvotes.push(req.user.id);
    else post.upvotes.splice(idx, 1);
    await post.save();
    res.json({ upvotes: post.upvotes.length, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/communities/posts/:pid/comment — add comment
router.post('/posts/:pid/comment', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.pid);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user.id, content: req.body.content });
    await post.save();
    const updated = await CommunityPost.findById(req.params.pid)
      .populate('comments.author', 'name profileImage');
    res.json(updated.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/communities/posts/:pid — delete post (own or admin)
router.delete('/posts/:pid', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.pid);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
