var path = require('path');

module.exports = {
  entry: './app_client/js/index',
  output: {
    path: path.resolve(__dirname, 'app_client/js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}