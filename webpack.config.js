var argv = require('minimist')(process.argv.slice(2));

var entry = {
  example: [
    './examples/src/example.jsx',
  ]
};

if (argv.dist !== true) {
  entry.example.push('webpack/hot/dev-server');
}

module.exports = {
  entry: entry,
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