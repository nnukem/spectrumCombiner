import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
// import Manifest from './manifest'
import path from 'path'
import config from '../config'
import pathToUrl from '../lib/path-to-url'

module.exports = (env) => {
  const jsSrc = path.resolve(config.root.src, config.tasks.js.src)
  const jsDest = path.resolve(path.join(env === 'production' ? config.root.dist : '', config.tasks.js.dest))

  const publicPath = pathToUrl(config.tasks.js.dest, '/')
  const extensions = config.tasks.js.extensions.map((extension) => {
    return '.' + extension
  })

  const rev = config.tasks.rev.enabled && env === 'production'
  const filenamePattern = rev ? '[name]-[hash].js' : '[name].js'

  const webpackConfig = {
    context: jsSrc,
    plugins: [],
    resolve: {
      extensions: extensions,
      modules: ['node_modules', 'src/js'],
      unsafeCache: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        }
      ]
    }
  }

  webpackConfig.entry = config.tasks.js.entries

  webpackConfig.output = {
    path: path.normalize(jsDest),
    filename: filenamePattern,
    publicPath: publicPath
  }

  webpackConfig.devtool = 'inline-source-map'

  webpackConfig.optimization = {
    minimizer: [new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: false
    })]
  }

  if (config.tasks.js.extractSharedJs) {
    // Factor out common dependencies into a shared.js
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: 'shared',
        filename: filenamePattern
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    )
  }

  webpackConfig.plugins.push(
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    // new BundleAnalyzerPlugin()
  )

  if (env === 'development') {
    // Create new entries object with webpack-hot-middleware added
    for (var key in config.tasks.js.entries) {
      var entry = config.tasks.js.entries[key]
      config.tasks.js.entries[key] = ['webpack-hot-middleware/client?&reload=true'].concat(entry)
    }

    webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    )
  }

  // if (rev) {
  //   webpackConfig.plugins.push(new Manifest(publicPath, path.join(config.root.dist, config.root.dest)))
  // }

  if (env === 'development') {
    webpackConfig.mode = 'development'
  }

  if (env === 'production') {
    webpackConfig.mode = 'production'
  }

  return webpackConfig
}
