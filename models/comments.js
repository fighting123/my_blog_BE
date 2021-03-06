const marked = require('marked')
const Comment = require('../lib/mongo').Comment

// 将 comment 的 content 从 markdown 转换成 html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map((comment) => {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

module.exports = {
  // 创建一个留言
  create: function create(comment) {
    return Comment.create(comment).exec()
  },
  // 通过留言id获取一个留言
  getCommentById: function getCommentById(commentId) {
    return Comment.findOne({_id: commentId}).exec()
  },
  // 通过留言id删除一个留言
  delCommentById: function delCommentById(commentId) {
    return Comment.remove({_id: commentId}).exec()
  },
  // 通过文章id删除该文章下所有留言
  // 删除一篇文章成功后也要删除该文章下所有的评论
  delCommentsByPostId: function delCommentsByPostId(postId) {
    return Comment.remove({postId: postId}).exec()
  },
  // 通过文章id获得该文章下所有的留言，按留言创建时间升序
  getComments: function getComments(postId) {
    return Comment
      .find({postId: postId})
      .populate({path: 'author', model: 'User'})
      .sort({_id: 1})
      .addCreateAt()
      .contentToHtml()
      .exec()
  },
  // 通过文章id获取该文章下的留言数
  getCommentsCount: function getCommentsCount(postId) {
    return Comment.count({postId: postId}).exec()
  }
}
