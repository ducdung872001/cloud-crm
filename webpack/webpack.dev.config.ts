import path from "path";
import { Configuration } from "webpack";
import { Configuration as DevServerConfiguration } from "webpack-dev-server";
import sass from "sass";
import { merge } from "webpack-merge";
import common from "./webpack.common.config";
import Dotenv from "dotenv-webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const devServer: DevServerConfiguration = {
  static: path.join(__dirname, "build"),
  //TODO: đoạn này tạm đóng lại
  // static: {
  //   directory: path.join(__dirname, "build"),
  // },
  historyApiFallback: true,
  port: 4000,
  open: true,
  hot: true,
};

const config: Configuration = {
  mode: "development",
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "../bundle"),
    filename: (pathData: any) => {
      return "crm/[name].js";
    },
    //TODO: đoạn này tạm đóng lại
    // filename: (pathData: any) => {
    //   return pathData.chunk.name === "firebase-messaging-sw" ? "crm/[name].js" : "crm/js/[name].bundle.[chunkhash].js";
    // },
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: { implementation: sass },
          },
        ],
      },
    ],
  },
  devtool: "inline-source-map",
  devServer,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "crm/css/[name].[chunkhash].css",
      chunkFilename: "crm/css/[id].[chunkhash].css",
    }),
    new Dotenv({
      path: path.resolve(__dirname, "../.env"),
      allowEmptyValues: true,
      systemvars: true,
      silent: true,
    }),
  ],
};

export default merge(common, config);
