const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout 登出
router.get('/', checkLogin, function (req, res, next) {
  // 清空session中的用户信息
  req.session.user = null
  req.flash('success', '登出成功')
  res.send({status: 'success', message: '登出成功'})
})

module.exports = router
