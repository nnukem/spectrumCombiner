
import gulp from 'gulp'
import webpack from 'webpack'
import webpackMultiConfig from '../webpack/base'
import compileLogger from '../lib/compile-logger'

const webpackProductionTask = (cb) => {
  webpack(webpackMultiConfig('production'), (err, stats) => {
    compileLogger(err, stats)
    cb()
  })
}

gulp.task('webpackProduction', webpackProductionTask)
module.exports = webpackProductionTask
