import gulp from 'gulp'
import posix from 'path-posix'
import svgSprite from 'gulp-svg-sprite'
import config from '../config'

const configSvg = {
  mode: {
    symbol: true,
    sprite: 'sprite.<mode>.svg'
  }
}

const paths = {
  src: posix.join(config.root.src, config.tasks.svgSprites.src),
  dest: posix.join(config.root.dest, config.tasks.svgSprites.dest)
}

const svgSpritesTask = (cb) => {
  return gulp.src('**/*.svg', {
    cwd: paths.src
  })
    .pipe(svgSprite(configSvg))
    .pipe(gulp.dest(posix.join(global.production ? config.root.dist : '', paths.dest)))
}

gulp.task('svgsprites', svgSpritesTask)
module.exports = svgSpritesTask
