import gulp from 'gulp'
import posix from 'path-posix'
import browserSync from 'browser-sync'
import gulpif from 'gulp-if'
import gulpChanged from 'gulp-changed'
import config from '../config'

const paths = {
  src: posix.join(config.root.src, config.tasks.fonts.src, '/**/*.{' + config.tasks.fonts.extensions + '}'),
  dest: posix.join(config.root.dest, config.tasks.fonts.dest)
}

const fontsTask = () => {
  return gulp.src([paths.src, '*!README.md'])
    .pipe(gulpif(!global.production, gulpChanged(paths.dest))) // Ignore unchanged files
    .pipe(gulp.dest(posix.join(global.production ? config.root.dist : '', paths.dest)))
    .pipe(gulpif(!global.production, browserSync.stream()))
}

gulp.task('fonts', fontsTask)
module.exports = fontsTask
