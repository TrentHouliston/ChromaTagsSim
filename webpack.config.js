var webpack = require('webpack');

module.exports = {
	context: __dirname + '/public/app',
	entry: './init_app',
	output: {
		path: __dirname + '/dist',
		filename: 'app_bundle.js'
	},
  resolveLoader: {
    root: __dirname + '/node_modules'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
	devServer: {
		contentBase: 'public',
		hot: true
	},
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    })
  ],
  devtool: 'inline-source-map'
};