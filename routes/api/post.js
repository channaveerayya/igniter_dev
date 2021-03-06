const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @router    POST api/posts
// @desc      Create a post
// @access    Private
router.post('/',
  [auth, [
    check('text', 'Text is required').not().isEmpty(),
  ]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.json(post)
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });

// @router    GET api/posts
// @desc      Get all Posts
// @access    Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @router    GET api/posts/:id
// @desc      Get Post by id
// @access    Private
router.get('/:id', auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ msg: 'Post not Found' });
    res.json(post);

  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post not Found' });
    res.status(500).send('Server error');
  }

});

// @router    DELETE api/posts/:id
// @desc      DELETE Post by id
// @access    Private
router.delete('/:id', auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ msg: 'Post not Found' });

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'USER not authorized' });

    await post.remove();
    res.json({ msg: 'Post removed' });

  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post not Found' });
    res.status(500).send('Server error');
  }

});

// @router    PUT api/posts/like/:id
// @desc      Like a Post
// @access    Private
router.put('/like/:id', auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.filter(like => like.user.toString() === req.user.id).length)
      return res.status(400).json({ msg: 'Post already Liked' });

    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }

});

// @router    PUT api/posts/unlike/:id
// @desc      Unlike a Post
// @access    Private
router.put('/unlike/:id', auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0)
      return res.status(400).json({ msg: 'No Post has yet been Liked' });

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }

});


// @router    POST api/posts/comment/:id
// @desc      Comments on posts
// @access    Private
router.post('/comment/:id',
  [auth, [
    check('text', 'Text is required').not().isEmpty(),
  ]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');

      const post = await Post.findById(req.params.id);

      const newComment = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments)

    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });

// @router    DELETE api/posts/comment/:id/:comment_id
// @desc      DELETE a comment
// @access    Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = post.comments.find(cmt => cmt.id === req.params.comment_id);

    if (!comment)
      return res.status(404).json({ msg: "Comment is not exists" });

    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "User not authorized" });

    const removeIndex = post.comments.map(cmt => cmt.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;