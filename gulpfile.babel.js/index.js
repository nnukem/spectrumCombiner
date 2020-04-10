import gulp from 'gulp'
import clean from './tasks/clean'
import css from './tasks/css'
import html from './tasks/html'
import images from './tasks/images'
import watch from './tasks/watch'
import browserSync from './tasks/browser-sync'
import svgSprites from './tasks/svg-sprites'
import fonts from './tasks/fonts'
import rev from './tasks/rev'
import critical from './tasks/critical'
import webpackProduction from './tasks/webpack-production'
import config from './config'

global.production = false

// Production task
const prod = function () {
  if (global.process.argv.includes('production')) {
    global.production = true
  }

  let tasks = [clean, html, css, images, svgSprites, webpackProduction]

  if (config.tasks.critical.enabled) {
    tasks.push(critical)
  }

  if (config.tasks.rev.enabled) {
    tasks.push(rev)
  }

  return tasks
}

// Dev task
const dev = function () {
  return [html, css, images, svgSprites, fonts, gulp.parallel(browserSync, watch)]
}


// Sprites task
const sprites = function () {
  return [svgSprites]
}

gulp.task('default', gulp.series(...dev()))
gulp.task('production', gulp.series(...prod()))
gulp.task('svg-sprites', gulp.series(...sprites()))
