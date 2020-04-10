import gulp from 'gulp'
import browserSync from 'browser-sync'
import posix from 'path-posix'
import cssnano from 'gulp-cssnano'
import sass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import gulpif from 'gulp-if'
import handleErrors from '../lib/handle-errors'
import config from '../config'

const paths = {
  src: posix.join(config.root.src, config.tasks.css.src, '/**/main.{' + config.tasks.css.extensions + '}'),
  dest: posix.join(config.root.dest, config.tasks.css.dest)
}

const cssTask = () => {
  return gulp.src(paths.src)
    .pipe(sass(config.tasks.css.sass))
    .on('error', handleErrors)
    .pipe(autoprefixer(config.tasks.css.autoprefixer))
    .pipe(gulpif(global.production, cssnano({ autoprefixer: false })))
    .pipe(gulp.dest(posix.join(global.production ? config.root.dist : '', paths.dest)))
    .pipe(gulpif(!global.production, browserSync.stream()))
}

gulp.task('css', cssTask)
module.exports = cssTask
