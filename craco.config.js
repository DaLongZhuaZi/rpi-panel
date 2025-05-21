const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 添加 Node.js polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        child_process: false,
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        path: require.resolve('path-browserify'),
        fs: false,
        os: require.resolve('os-browserify/browser')
      };

      // 添加 ProvidePlugin 以提供全局变量
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      );

      return webpackConfig;
    },
  },
  // 添加开发服务器配置，确保所有路由都返回index.html
  devServer: {
    historyApiFallback: true
  }
}; 