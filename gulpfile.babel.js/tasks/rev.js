import gulp from 'gulp'
import posix from 'path-posix'
import gulpRev from 'gulp-rev'
import gulpRevDel from 'gulp-rev-delete-original'
import config from '../config'

const paths = {
  desc: posix.join(config.root.dist, config.root.dest)
}

const rev = () => {
  return gulp.src([posix.join(paths.desc, '/**/*.css')])
    .pipe(gulpRev())
    .pipe(gulpRevDel())
    .pipe(gulp.dest(paths.desc))
    .pipe(gulpRev.manifest(posix.join(paths.desc, 'manifest.json'), {
      merge: true
    }))
    .pipe(gulp.dest('./'))
}

gulp.task('rev', rev)
module.exports = rev
