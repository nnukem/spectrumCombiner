import gulp from 'gulp'
import del from 'del'
import config from '../config'

const cleanTask = (cb) => {
  const path = global.production ? config.root.dist : config.root.dest
  del([path]).then((paths) => {
    cb()
  })
}

gulp.task('clean', cleanTask)
module.exports = cleanTask
