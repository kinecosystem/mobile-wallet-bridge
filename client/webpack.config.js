var path = require('path');

module.exports = {
  entry: [
    './src/app.ts'
  ],
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: './[name].bundle.js',
    path: path.resolve(__dirname, 'js')
  }
}