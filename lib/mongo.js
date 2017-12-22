const config = require('config-lite')(__dirname)
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
mongolass.connect(config.mongodb)

const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

// 根据id生成创建时间created_at
mongolass.plugin('addCreateAt', {
  afterFind: function(results) {
    results.forEach(function (item) {
      item.create_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
    })
    return results
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
    }
    return result
  }
})

// 存储用户
// 只存储用户的名称、密码（加密后的）、头像、性别和个人简介这几个字段
exports.User = mongolass.model('User', {
  name: { type: 'string' },
  password: { type: 'string' },
  // avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'] },
  bio: { type: 'string' }
})
exports.User.index({ name: 1 }, { unique: true }).exec() // 根据用户名找到用户，用户名全局唯一

// 存储文章
// 只存储文章的作者 id、标题、正文和点击量这几个字段
exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId },
  title: { type: 'string' },
  content: { type: 'string' },
  pv: { type: 'number' }
})
exports.Post.index({ author: 1, _id: -1} ).exec()  // 按创建时间降序查看用户的文章列表
