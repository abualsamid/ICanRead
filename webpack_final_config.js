var webpack = require('webpack');

// PRODUCTION BUILD
// See article @ http://web-design-weekly.com/2014/09/24/diving-webpack/
module.exports =  {
  entry: './scripts/index',
  output: {
    filename: 'scripts/bundle.js',
    publicPath: '/scripts'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.js$|\.jsx/, exclude: /node_modules/, loader: "jsx?harmony"}
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    //http://davidwalsh.name/compress-uglify
    new webpack.optimize.UglifyJsPlugin({
      mangle:true,
      "copyright": false,
      compress: {
        booleans: true,
        cascade: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        evaluate: true,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        loops: true,
        properties: true,
        sequences: true,
        unused: true
        //unsafe: true
      }
    })
  ]
}