module.exports = {
  entry: {
    example: [
      'webpack/hot/dev-server',
      './examples/example.jsx',
    ]
  },
  output: {
    filename: '[name].js'
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