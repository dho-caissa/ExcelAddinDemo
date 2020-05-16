const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        functions: "./src/customfunctions/functions.ts",
        // functionJson: "./src/customfunctions/functions.json",
        polyfill: "@babel/polyfill",
    },
    module: {
        rules: [
            {
                test: /functions.ts$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "functions.html",
            template: "./src/customfunctions/index.html",
            chunks: [ "functions"]
        }),
        //   new CopyWebpackPlugin([
        //     {
        //       to: "functions.json",
        //       from: "./src/customfunctions/functions.json"
        //     }
        //   ]),
    ]
};
