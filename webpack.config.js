module.exports = {
  entry: {
    example: [
      'webpack/hot/dev-server',
      './examples/src/example.jsx',
    ]
  },
  output: {
    path: './examples/assets',
    filename: '[name].js',
    publicPath: '/assets/'
  },
  module: {
    loaders: [{
      test: /\.js(x)?/,
      loaders: ['babel-loader']
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};