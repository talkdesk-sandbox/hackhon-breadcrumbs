const merge = require("webpack-merge");
const common = require("./webpack.common");
const webpack = require("webpack");

/**
 * Webpack development configuration
 *
 * @author victorfern91@gmail.com
 * @since 1.0.0
 */

module.exports = merge(common, {
    mode: "development",

    devtool: "source-map",

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],

    devServer: {
        port: 8080,
        overlay: true,
        contentBase: "./dist",
        hot: true
    }
});
