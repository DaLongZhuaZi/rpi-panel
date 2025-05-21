const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'build')));

// 所有请求都返回 index.html
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
}); 