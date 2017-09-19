const path = require('path');
const webpack = require('webpack');

const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

const srcDirectory = path.join(__dirname, '/src');
const buildDirectory = path.join(__dirname, '/dist/browser');

const entry = path.join(srcDirectory, 'index.js');

module.exports = {
  entry: [
    'babel-polyfill',
    entry,
  ],
  output: {
    path: buildDirectory,
    filename: 'streamlabs-socket-client.min.js',
    library: 'StreamlabsSocket',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true,
      },
      compress: {
        screw_ie8: true,
      },
      comments: false,
    }),
    new UnminifiedWebpackPlugin(),
  ],
};
