import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const config: Configuration = {
  entry: "./src/main.tsx",
  //TODO: đoạn này tạm đóng lại
  // entry: {
  //   main: "./src/main.tsx",
  //   "crm/firebase-messaging-sw": "./src/firebase-messaging-sw.js",
  // },
  performance: {
    hints: false,
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
        test: /\.(jpg|jpe?g|png|gif|woff2?|ttf|eot)$/i,
        type: "asset/resource",
        generator: {
          filename: "crm/assets/[contenthash][ext]",
        },
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
      {
        test: /\.(wav|mp3)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "crm/assets/sounds", // Đường dẫn thư mục đích trong build output
              publicPath: "/crm/assets/sounds", // Đường dẫn public URL để truy cập (nếu cần)
            },
          },
        ],
      },
    ],
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: "all",
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {},
      }),
      new CssMinimizerPlugin({}),
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.resolve("./node_modules"), path.resolve("./src")],
    alias: {
      "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
      "react/jsx-runtime": "react/jsx-runtime.js",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      // favicon: "src/assets/images/favicon.ico",
      title: "Đăng nhập hệ thống Reborn CRM",
      // excludeChunks: ["crm/firebase-messaging-sw"],
    }),
    new FaviconsWebpackPlugin({
      logo: "src/assets/images/favicon.ico",
      prefix: "crm/",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, "../src/template/webform.js"), to: path.resolve(__dirname, "../bundle/crm/js") },
        { from: path.resolve(__dirname, "../src/template/contact.html"), to: path.resolve(__dirname, "../bundle/crm") },
      ],
    }),
  ],
};

export default config;
