const path = require('path');

module.exports = {
  // 其他 webpack 配置...
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      // 提供 Node.js 核心模块的 polyfill
      "child_process": false,
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "os": require.resolve("os-browserify/browser")
    }
  },
  
  // 如果使用 webpack 5，需要添加以下配置
  plugins: [
    // 其他插件...
    new (require('webpack')).ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
}; 