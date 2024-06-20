const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  devtool: "source-map",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "assets/**/*.*", context: "src/" },
        { from: "*.html", context: "src/" },
        { from: "*.css", context: "src/" },
      ],
    }),
  ],
  entry: {
    helloWorldDemo: {
      import: "./src/helloWorldDemo.js",
    },
    gesturesDemo: {
      import: "./src/gesturesDemo.js",
    },
    customCharacterDemo: {
      import: "./src/customCharacterDemo.js",
    },
    chatbotDemo: {
      import: "./src/chatbotDemo.js",
    },
    chatbotDemo_V2: {
      import: "./src/chatbotDemo_V2.js",
    },
  },
  resolve: {
    extensions: [".js"],
  },
  module: {},
  output: {
    clean: true,
  },
  devServer: {
    static: "./dist",
    liveReload: true,
    hot: true,
    open: "/",
    watchFiles: ["./src/index.html"],
  },
};
// replace the the devServer with the below code while deploying to ECS fargate/EC2, to be able to access it through http request.
// later use load balancer to configure https request (inorder to access mic) 
/* devServer: {
  static: "./dist",
  liveReload: true,
  hot: true,
  host: '0.0.0.0',  // Allow server to be accessible externally
  port: 8080,        // Optional: Change as necessary, use 80 for EC2
  open: "/",
  watchFiles: ["./src/index.html"],
  allowedHosts: 'all',
}, */
