var path = require('path');
var fs = require('fs');
module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/posts')
  })
  app.get('/api/image/:url', function (req, res) {
    // 获取到图片的在后台的完整路径，否则拿不到图片
    var imagePathName = ''
    imagePathName = path.join(path.resolve(__dirname, '..'), '/public/image/', req.params.url)
    // 读取图片
    fs.readFile(imagePathName, 'binary', function (err, data) {
      if (err) {
        res.writeHead(500,{"Content-Type":"text/plain"});
        res.write(error+"\n");
        res.end();
      } else {
        res.writeHead(200,{"Content-Type":"image/png"});
        // 不能用send，否则会浏览器报错：504 (Gateway Timeout)
        // res.send(data, 'binary');
        res.end(data, "binary");
      }
    })
  })
  app.use('/api/signup', require('./signup'))
  app.use('/api/signin', require('./signin'))
  app.use('/api/signout', require('./signout'))
  app.use('/api/posts', require('./posts'))
  app.use('/api/comments', require('./comments'))
}
