const express = require('express')
const router = express.Router()
var path = require('path');
var sha1 = require('sha1');
var fs = require('fs');

const checkNotLogin = require('../middlewares/check').checkNotLogin
const UserModel = require('../models/users.js');
// 先把图片存储起来
router.post('/image', function (req, res, next) {
  res.send({status: 'success'})
})
// POST /signup 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  // 读取image文件夹取files第一个为刚才注册所用的图片
  fs.readdir('public/img', function (err, files) {
    if (err) {
      console.log(err);
      return;
    }
    // var imagePathName = ''
    // imagePathName = path.join(path.resolve(__dirname, '..'), '/public/image/', files[0])
    var name = req.fields.name
    var gender = req.fields.gender
    var bio = req.fields.bio
    var password = req.fields.password
    var repassword = req.fields.repassword

    // 明文密码加密
    password = sha1(password);
    // 待写入数据库的用户信息
    var user = {
      name: name,
      gender: gender,
      bio: bio,
      avatar: files[0],
      password: password,
      repassword: repassword
    }
    // 用户信息写入数据库
    UserModel.create(user)
      .then(function (result) {
        // 此 user 是插入 mongodb 后的值，包含 _id
        user = result.ops[0]
        // 删除密码这种敏感信息，将用户信息存入 session
        delete user.password
        req.session.user = user
        // 这样保证每次保存到数据库的图片名称都是注册用户对应的
        // img文件夹是临时存储注册瞬间的图片，image是才是真的存图片的文件
        var imagePathName = path.join(path.resolve(__dirname, '..'), '/public/img/', files[0])
        var imageNewPathName = path.join(path.resolve(__dirname, '..'), '/public/image/', files[0])
        fs.rename(imagePathName, imageNewPathName, function (err) {
          if (err) {
            return;
          }
        })
        res.send({status: 'success', message: '注册成功'})
      })
      .catch(function (e) {
        // 注册失败，异步删除上传的头像
        // fs.unlink(imagePathName)
        // 用户名被占用则跳回注册页，而不是错误页
        if (e.errmsg.match('duplicate key')) {
          // req.flash('error', '用户名已被占用')
          res.send({status: 'error', message: '用户名已被占用'})
        }
        // next(e)
      })
  })
})

module.exports = router
