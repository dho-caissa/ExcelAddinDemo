const devCerts = require("office-addin-dev-certs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const webpack = require("webpack");
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: "source-map",
    entry: {
      functions: "./src/functions.ts",
      polyfill: "@babel/polyfill",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "babel-loader"
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: "ts-loader"
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader"
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: "file-loader"
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: dev ? [] : ["**/*"]
      }),
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: "./src/functions.ts"
      }),
      new HtmlWebpackPlugin({
        filename: "functions.html",
        template: "./src/functions.html",
        chunks: ["functions"]
      }),
      new HtmlWebpackPlugin({
        filename: "function-file.html",
        template: "./src/function-file.html",
        chunks: []
      }),
      new MomentLocalesPlugin(),
    ]
  };

  if (dev) {
    config.devServer = {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      https: await devCerts.getHttpsServerOptions(),
      port: 3000
    }
  }

  return config;
};
