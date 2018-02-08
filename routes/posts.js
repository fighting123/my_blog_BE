const express = require('express')
const router = express.Router()
const postsModel = require('../models/posts')
const CommentModel = require('../models/comments')

const checkLogin = require('../middlewares/check').checkLogin
// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  const author = req.query.author

  postsModel.getPosts(author)
    .then(function (posts) {
      res.send({status: 'success', posts: posts})
    })
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content
  let post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  }
  postsModel.create(post)
    .then((result) => {
      // 此post是插入到mongoDb后的值，包含_id
      post = result.ops[0]
      req.flash('success', '发表成功')
      res.send({status: 'success', message: '发表文章成功'})
    })
    .catch(() => {
      res.send({status: 'success', message: '发表文章失败'})
    })
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.send('发表文章页')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    postsModel.getPostById(postId), // 获取文章信息
    CommentModel.getComments(postId), // 获取该文章所有留言
    postsModel.incPv(postId)  // pv(点击量)加1
  ])
    .then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        res.send({status: 'error', message: '该文章不存在'})
        throw new Error('该文章不存在')
      }
      res.send({status: 'success', post: post, comments: comments})
    })
    .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  postsModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        res.send({status: 'error', message: '文章不存在'})
        throw new Error('文章不存在')
      } else if (post.author._id.toString() !== author.toString()) {
        res.send({status: 'error', message: '没有权限'})
        // throw new Error('没有权限')
      } else {
        res.send({status: 'success', post: post})
      }
    })
    .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  postsModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        res.send({status: 'success', message: '文章不存在'})
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        res.send({status: 'success', message: '没有权限'})
        throw new Error('没有权限')
      }
      postsModel.updatePostById(postId, {title: title, content:content})
        .then(function () {
          req.flash('success', '编辑文章成功')
          // 编辑成功后跳转到上一页
          res.send({status: 'success', message: '编辑文章成功'})
        })
        .catch(() => {
          res.send({status: 'error', message: '编辑文章失败'})
        })
    })
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  postsModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        res.send({status: 'error', message: '文章不存在'})
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        res.send({status: 'error', message: '没有权限'})
        throw new Error('没有权限')
      }
      postsModel.deletePostById(postId, author)
        .then(function () {
          req.flash('success', '删除文章成功')
          res.send({status: 'success', message: '删除文章成功'})
        })
        .catch(() => {
          res.send({status: 'error', message: '删除文章失败'})
        })
    })
})

module.exports = router
