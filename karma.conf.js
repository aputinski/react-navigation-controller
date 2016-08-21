// Karma configuration
// Generated on Sat Mar 28 2015 02:55:40 GMT-0400 (EDT)

module.exports = (config) => {
  let c = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    client: {
      mocha: {
        timeout: 5000
      }
    },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'spec/**/*.spec.+(jsx|js)'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'spec/**/*.spec.+(jsx|js)': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-webpack',
      'karma-spec-reporter',
      'karma-chrome-launcher'
    ],

    webpack: {
      module: {
        loaders: [{
          test: /\.js(x)?/,
          loaders: ['babel-loader']
        }]
      },
      resolve: {
        extensions: ['', '.js', '.jsx']
      }
    },

    webpackMiddleware: {
      noInfo: true
    }

  }

  if (process.env.TRAVIS) {
    c.browsers = ['ChromeTravis']
  }

  config.set(c)
}
