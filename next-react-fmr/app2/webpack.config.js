const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { ModuleFederationPlugin } = webpack.container;
const deps = require('./package.json').dependencies;
const { MFLiveReloadPlugin } = require('@module-federation/fmr');

const isDevelopment = process.env['NODE_ENV'] !== 'production';

const config = {
  entry: './src/index',
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'hidden-source-map' : 'eval',
  devServer: {
    port: 3002,
    static: { directory: path.join(__dirname, 'public') },
    historyApiFallback: true,
    compress: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: { browsers: ['last 2 chrome versions'] },
                    debug: isDevelopment,
                  },
                ],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                isDevelopment && require.resolve('react-refresh/babel'),
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(p|s)?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(svg|png|jpe?g|gif|ico)$/i,
        type: 'asset/resource',
      },
      {
        test: /.(woff2?|eot|(o|t)tf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: isDevelopment ? 'development' : 'production',
    }),
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'app2RemoteEntry.js',
      exposes: {
        './Button': './src/components/Button2',
      },
      shared: {
        react: { singleton: true, requiredVersion: deps['react'] },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
      },
    }),
    new MFLiveReloadPlugin({
      port: 3002,
      container: 'app2',
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    !isDevelopment && new webpack.LoaderOptionsPlugin({ minimize: true }),
  ].filter(Boolean),
  output: {
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
  },
};

module.exports = config;