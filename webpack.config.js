const path = require("path");
const webpack = require('webpack')
const resolve = require('path').resolve

module.exports = {
    mode: 'development',
    entry: '/src/index.js',  
    output: {
    filename: "index.js",
    path: path.resolve(__dirname, "build"),
  },
  target:'node12.18',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: ['pg', 'sqlite3', 'tedious', 'pg-hstore','ejs'],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /express\/lib/,
      resolve(__dirname, '../node_modules'),
      {
        'ejs': 'ejs'
      }
    )
  ],
 stats: {
    warningsFilter: /require\.extensions/
  }
};
