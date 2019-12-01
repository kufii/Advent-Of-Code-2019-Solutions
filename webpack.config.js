'use strict';

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/iu,
        exclude: /node_modules/u,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/iu,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
