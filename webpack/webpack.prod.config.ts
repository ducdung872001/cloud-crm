import { LoaderOptionsPlugin, Configuration } from "webpack";
import sass from "sass";
import { merge } from "webpack-merge";
import common from "./webpack.common.config";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import Dotenv from "dotenv-webpack";
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config: Configuration = {
  mode: "production",
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "../bundle"),
    filename: "crm/js/[name].bundle.[chunkhash].js",
    //TODO: đoạn này tạm đóng lại
    // filename: (pathData: any) => {
    //   return pathData.chunk.name === "firebase-messaging-sw" ? "crm/[name].js" : "crm/js/[name].bundle.[chunkhash].js";
    // },
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          {
            loader: "sass-loader",
            options: { implementation: sass },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "crm/css/[name].[chunkhash].css",
      chunkFilename: "crm/css/[id].[chunkhash].css",
    }),
    new LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new Dotenv({
      path: path.resolve(__dirname, "../.env.prod"),
      allowEmptyValues: true,
      systemvars: true,
      silent: true,
    })
  ],
};

export default merge(common, config);
