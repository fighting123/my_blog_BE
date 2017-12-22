const Post = require('../lib/mongo').Post
const marked = require('marked')  // markedown文档转为html

Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map((post) => {
      post.content = marked(post.content)
      return post
    })
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content)
    }
    return post
  }
})

module.exports = {
  // 创建一篇文章
  create: function create(post) {
    return Post.create(post).exec()
  },

  // 通过id获取一篇文章
  getPostById: function getPostById(postId) {
    return Post
      .findOne({_id: postId})
      .populate({path: 'author', model: 'User'})
      .addCreateAt()
      .contentToHtml()
      .exec()
  },

  // 按创建时间降序获取所有用户文章或某个特定用户的所有文章
  getPosts: function getPosts(author) {
    const query = {}
    if (author) {
      query.author = author
    }
    return Post
      .find(query)
      .populate({path: 'author', model: 'User'})
      .sort({_id: -1})
      .addCreateAt()
      .contentToHtml()
      .exec()
  },

  // 通过id给pv（点击量）加1
  incPv: function incPv(postId) {
    return Post
      .update({_id: postId}, {$inc: {pv: 1}})
      .exec()
  },

  // 通过文章 id 获取一篇原生文章（编辑文章不与获取文章一个接口：编辑文章需要原生内容，而不是markdown）
  getRawPostById: function getRawPostById (postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec()
  },

  // 通过文章id更新一篇文章
  updatePostById: function updatePostById(postId, data) {
    return Post.update({_id: postId}, { $set: data}).exec()
  },

  //通过文章id删除一篇文章
  deletePostById: function deletePostById(postId) {
    return Post.remove({_id: postId}).exec()
  }
}
