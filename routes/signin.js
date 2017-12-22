const express = require('express')
const router = express.Router()
const sha1 = require('sha1')

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
  // res.send('登录')
  const name = req.fields.name
  const password = req.fields.password

  UserModel.getUserByName(name)
    .then((user) => {
      if (!user) {
        req.flash('error', '用户不存在');
        res.send({status: 'error', message: '用户不存在'})
      }
      // 检查密码是否匹配
      if (sha1(password) !== user.password) {
        req.flash('error', '用户名或密码错误');
        res.send({status: 'error', message: '用户名或密码错误'})
      }
      req.flash('success', '登录成功')
      delete user.password
      // 用户信息写入session
      req.session.user = user
      res.send({status: 'success', message: '登录成功'})
    })
})

module.exports = router
