const express = require('express')
const router = express.Router()
var path = require('path');
var sha1 = require('sha1');

const checkNotLogin = require('../middlewares/check').checkNotLogin
const UserModel = require('../models/users.js');
// GET /signup 注册页
router.get('/', checkNotLogin, function (req, res, next) {
  res.send('注册页')
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  // res.send('注册')
  var name = req.fields.name
  var gender = req.fields.gender
  var bio = req.fields.bio
  // var avatar = req.fields.avatar.path.split(path.sep).pop()
  var password = req.fields.password
  var repassword = req.fields.repassword

  // 明文密码加密
  password = sha1(password);
  // 待写入数据库的用户信息
  var user = {
    name: name,
    gender: gender,
    bio: bio,
    // avatar: avatar,
    password: password,
    repassword: repassword
  }
  // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 删除密码这种敏感信息，将用户信息存入 session
      delete user.password
      // req.session.user = user
      // 写入 flash
      req.flash('success', '注册成功')
      res.send({status: 'success', message: '注册成功'})
    })
    .catch(function (e) {
      // 注册失败，异步删除上传的头像
      // fs.unlink(req.files.avatar.path)
      // 用户名被占用则跳回注册页，而不是错误页
      // if (e.errmsg.match('duplicate key')) {
      //   req.flash('error', '用户名已被占用')
      // }
      res.send({status: 'success', message: '用户名已被占用'})
      // next(e)
    })
})

module.exports = router
