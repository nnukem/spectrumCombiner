import gulp from 'gulp'
import browserSync from 'browser-sync'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackMultiConfig from '../webpack/base'
import pathToUrl from '../lib/path-to-url'
import config from '../config'

const browserSyncTask = () => {
  const webpackConfig = webpackMultiConfig('development')
  const compiler = webpack(webpackConfig)
  const proxyConfig = config.tasks.browserSync.proxy || null

  if (typeof (proxyConfig) === 'string') {
    config.tasks.browserSync.proxy = {
      target: proxyConfig
    }
  }

  const server = config.tasks.browserSync.proxy || config.tasks.browserSync.server

  server.middleware = [
    webpackDevMiddleware(compiler, {
      stats: false,
      publicPath: pathToUrl('/', webpackConfig.output.publicPath)
    }),
    webpackHotMiddleware(compiler, {
      hot: true
    })
  ]

  browserSync.init(config.tasks.browserSync)
}

gulp.task('browserSync', browserSyncTask)
module.exports = browserSyncTask
