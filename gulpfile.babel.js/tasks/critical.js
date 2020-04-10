import gulp from 'gulp'
import posix from 'path-posix'
import critical from 'critical'
import config from '../config'

const paths = {
  src: posix.join(config.root.dist, config.tasks.critical.src),
  dest: config.root.dist
}

const criticalConfig = {
  inline: true,
  base: paths.dest,
  height: config.tasks.critical.height,
  width: config.tasks.critical.width,
  minify: true,
  extract: false,
  ignore: ['font-face']
}

const criticalTask = function (cb) {
  return gulp.src(paths.src)
    .pipe(critical.stream(criticalConfig))
    .pipe(gulp.dest(paths.dest))
}

gulp.task('critical', criticalTask)
module.exports = criticalTask
