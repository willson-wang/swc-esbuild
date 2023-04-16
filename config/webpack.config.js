const path = require('path');
const { ProgressPlugin } = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const HtmlWebpackPlugin = require('html-webpack-plugin')

const scriptloader = (() => {
  if (process.env.TRANSFORM === 'swc') {
    return {
      loader: 'swc-loader',
      options: {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
          },
          externalHelpers: true, // 注意这里设置true时，需要在项目下安装@swc/helpers
          target: 'es5',
        },
        env: {
          targets: "last 3 major versions, > 0.1%", // 根据项目设置
          mode: "usage",
          coreJs: "3" // 根据项目选择
        },
        isModule: 'unknown'
      }
    }
  } else if (process.env.TRANSFORM === 'esbuild') {
    return {
      loader: 'esbuild-loader',
      options: {
        target: 'es2015',
        loader: 'tsx'
      }
    }
  } else {
    return {
      loader: 'babel-loader',
      options: {}
    }
  }
})();

console.log('scriptloader', scriptloader);

const minimizer = (() => {
  if (process.env.MINI === 'swc') {
    const TerserPlugin = require('terser-webpack-plugin');
    const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
    return [
      new TerserPlugin({
        terserOptions: {
          compress: {
            unused: true,
            drop_console: true,
            drop_debugger: true
          },
          mangle: true,
        },
        minify: TerserPlugin.swcMinify,
      }),
      new CssMinimizerPlugin(),
    ]
  } else if (process.env.MINI === 'esbuild') {
    const { EsbuildPlugin } = require('esbuild-loader');
    return [
      new EsbuildPlugin(
        {
          target: 'es2015',
          css: true
        }
      ),
    ]
  } else {
    const TerserPlugin = require('terser-webpack-plugin');
    const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
    return [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        },
      }),
      new CssMinimizerPlugin(),
    ]
  }
})();

console.log('minimizer', minimizer);

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  cache: {
    type: 'filesystem',
    name: 'production-cache',
    version: 'production',
  },
  profile: false,
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'chunk/[name].[chunkhash].js',
    publicPath: './'
  },
  resolve: {
    symlinks: true,
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@assets': path.resolve(__dirname, '../src/assets'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@pages': path.resolve(__dirname, '../src/pages'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@store': path.resolve(__dirname, '../src/store'),
      '@api': path.resolve(__dirname, '../src/api'),
      '@types': path.resolve(__dirname, '../src/types'),
    },
    extensions: [
      '.tsx',
      '.ts',
      '.jsx',
      '.js'
    ],
    mainFields: [
      'browser',
      'main:h5',
      'module',
      'main'
    ]
  },
  module: {
    rules: [
      {
        test: /\.(css|less|s[a|c]ss)(\?.*)?$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
          }
        ]
      },
      {
        test: /\.[tj]sx?$/i,
        exclude: /node_modules/,
        use: [scriptloader]
      },
      {
        test: /\.(png|jpe?g|gif|bpm|svg|webp)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10240
          }
        },
        generator: {
          filename: 'image/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10240
          }
        },
        generator: {
          filename: 'static/fonts/[name].[hash][ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|m4a|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10240
          }
        },
        generator: {
          filename: 'static/media/[name].[hash][ext]'
        }
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source'
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      minSize: 819200,
      minChunks: 1,
      maxSize: 1843200,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      cacheGroups: {
        'default': false,
        vendors: {
          test: /[\\\/]node_modules[\\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'vendors'
        },
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          name: 'common'
        },
        react: {
          test: /[\\\/]node_modules[\\\/](core-js|react.*|redux.*|props-type|immer|history|@reduxjs\/toolkit)[\\\/]/,
          priority: 0,
          reuseExistingChunk: true,
          name: 'react',
          minSize: 0
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    },
    emitOnErrors: true,
    minimizer
  },
  plugins: [
    new ProgressPlugin(
      {
        percentBy: 'entries',
        profile: false
      }
    ),
    new MiniCssExtractPlugin(
      {
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[contenthash].css'
      }
    ),
    new HtmlWebpackPlugin(
      {
        filename: 'index.html',
        template: path.join(__dirname, '../public/index.html'),
        minify: {
          collapseWhitespace: true,
          minifyJS: true,
          html5: true,
          minifyCSS: true,
          removeComments: true,
          removeTagWhitespace: false
        },
      }
    ),
  ],
  entry: {
    app: path.join(__dirname, '../src/app')
  }
}
