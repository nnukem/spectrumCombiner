import gulp from 'gulp'
import browserSync from 'browser-sync'
import posix from 'path-posix'
import gulpif from 'gulp-if'
import gulpChanged from 'gulp-changed'
import gulpImagemin from 'gulp-imagemin'
import config from '../config'

const paths = {
  src: posix.join(config.root.src, config.tasks.images.src, '/**/*.{' + config.tasks.images.extensions + '}'),
  dest: posix.join(config.root.dest, config.tasks.images.dest)
}

const imagesTask = () => {
  return gulp.src([paths.src, '*!README.md'])
    .pipe(gulpif(!global.production, gulpChanged(paths.dest))) // Ignore unchanged files
    .pipe(gulpif(global.production, gulpImagemin())) // minify if it's production task
    .pipe(gulp.dest(posix.join(global.production ? config.root.dist : '', paths.dest)))
    .pipe(gulpif(!global.production, browserSync.stream()))
}

gulp.task('images', imagesTask)
module.exports = imagesTask
