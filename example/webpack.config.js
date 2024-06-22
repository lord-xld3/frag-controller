const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const parentDir = path.resolve(__dirname, '../');

module.exports = {
    entry: {
        main: [
            './main.ts', 
            './main.css',
            './favicon.ico',
            './shaders/background.fs',
            './shaders/mandelbrot.fs',
        ],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(parentDir, './dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif|webp|sh|ico)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    },
                    {
                        loader: 'webpack-glsl-minify',
                        options: {
                            output: 'sourceOnly',
                        },
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.glsl', '.vs', '.fs', '.vert', '.frag'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            },
            favicon: './favicon.ico',
        }),
        new MiniCssExtractPlugin({
            filename: 'main.css', // Specify the name for the generated CSS file
        }),
        new BundleAnalyzerPlugin(),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // Removes console.* calls
                        keep_fargs: false, // Removes unused function arguments
                        keep_infinity: true, // Keeps the keyword infinity
                        unsafe: true, // Apply Terser's unsafe optimizations
                    },
                },
            }),
            new CssMinimizerPlugin(),
        ],
    },
};
