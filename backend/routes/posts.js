const express = require('express');
const { body } = require('express-validator');
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getMyPosts
} = require('../controllers/postController');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('category')
    .optional()
    .isIn(['career', 'networking', 'advice', 'opportunities', 'events', 'general'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string of comma-separated values')
];

const commentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// Public routes (authenticated users can view posts)
router.get('/', auth, getAllPosts);
router.get('/my-posts', auth, getMyPosts);
router.get('/:id', auth, getPost);
router.delete('/:id', auth, deletePost);
// Alumni and Admin can create posts
router.post('/', auth, checkRole('alumni', 'admin'), postValidation, createPost);

// Author or admin can update/delete posts
router.put('/:id', auth, postValidation, updatePost);
router.delete('/:id', auth, deletePost);

// All authenticated users can like posts and comment
router.post('/:id/like', auth, likePost);
router.post('/:id/comments', auth, commentValidation, addComment);

// Author or admin can delete comments
router.delete('/:postId/comments/:commentId', auth, deleteComment);

module.exports = router;