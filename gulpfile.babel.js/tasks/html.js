import gulp from 'gulp'
import path from 'path'
import posix from 'path-posix'
import browserSync from 'browser-sync'
import data from 'gulp-data'
import twig from 'gulp-twig'
import fs from 'fs'
import gulpif from 'gulp-if'
import config from '../config'
import handleErrors from '../lib/handle-errors'

const exclude = posix.normalize('!**/{' + config.tasks.html.excludeFolders.join(',') + '}/**')
const isWin = process.platform === 'win32'

const paths = {
  src: [posix.join(config.root.src, config.tasks.html.src, '/*.{' + config.tasks.html.extensions + '}'), exclude],
  dest: posix.join('./')
}

const getData = function (file) {
  const dataPath = posix.resolve(config.root.src, config.tasks.html.src, config.tasks.html.data)
  const fileName = dataPath + '/' + (isWin ? path.win32.basename(file.path, '.twig') : path.basename(file.path, '.twig')) + '.json'

  if (fs.existsSync(fileName)) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'))
  }
}

const getDataOne = function (file) {
  const dataPath = posix.resolve(config.root.src, config.tasks.html.src, config.tasks.html.dataFile)
  const fileName = dataPath

  return JSON.parse(fs.readFileSync(fileName, 'utf8'))
}

var twigExtends = function (Twig) {
  /**
   * Tag "autoescape"
   * @output - content between tags
   */
  Twig.exports.extendTag({
    // unique name for tag type
    type: 'autoescape',
    // regex match for tag (autoescape white-space anything)
    regex: /^autoescape\s+(.+)$/,
    // this is a standalone tag and doesn't require a following tag
    next: ['endautoescape'],
    open: true,

    // Runs when the template is rendered
    parse: function (token, context, chain) {
      // parse the tokens into a value with the render context
      var output = Twig.parse.apply(this, [token.output, context])

      return {
        chain: false,
        output: output
      }
    }
  })

  // a matching end tag type
  Twig.exports.extendTag({
    type: 'endautoescape',
    regex: /^endautoescape$/,
    next: [ ],
    open: false
  })

  /**
   * Tag "load"
   * @output - empty
   */
  Twig.exports.extendTag({
    // unique name for tag type
    type: 'load',
    // regex match for tag (load white-space anything)
    regex: /^load\s+(.+)$/,
    // this is a standalone tag and doesn't require a following tag
    next: [ ],
    open: true,

    // runs on matched tokens when the template is loaded. (once per template)
    compile: function (token) {
      var expression = token.match[1]

      // Compile the expression. (turns the string into tokens)
      token.stack = Twig.expression.compile.apply(this, [{
        type: Twig.expression.type.expression,
        value: expression
      }]).stack

      delete token.match
      return token
    },

    // Runs when the template is rendered
    parse: function (token, context, chain) {
      var output = ''

      return {
        chain: false,
        output: output
      }
    }
  })

  /**
   * Tag "static"
   * @output - path to file
   */
  Twig.exports.extendTag({
    // unique name for tag type
    type: 'static',
    // regex match for tag (load white-space anything)
    regex: /^static\s+(.+)$/,
    // this is a standalone tag and doesn't require a following tag
    next: [ ],
    open: true,

    // runs on matched tokens when the template is loaded. (once per template)
    compile: function (token) {
      var expression = token.match[1]

      // Compile the expression. (turns the string into tokens)
      token.stack = Twig.expression.compile.apply(this, [{
        type: Twig.expression.type.expression,
        value: expression
      }]).stack

      delete token.match
      return token
    },

    // Runs when the template is rendered
    parse: function (token, context, chain) {
      var output = context.global.static + token.stack[0].value

      return {
        chain: false,
        output: output
      }
    }
  })

  /**
   * Tag "svgSprite"
   * @output - path to file
   */
  Twig.exports.extendTag({

    // unique name for tag type
    type: 'svgSprite',
    // regex match for tag (load white-space anything)
    regex: /^svgSprite\s+(.+)$/,
    // this is a standalone tag and doesn't require a following tag
    next: [ ],
    open: true,

    // runs on matched tokens when the template is loaded. (once per template)
    compile: function (token) {
      var expression = token.match[1]

      // Compile the expression. (turns the string into tokens)
      token.stack = Twig.expression.compile.apply(this, [{
        type: Twig.expression.type.expression,
        value: expression
      }]).stack

      delete token.match
      return token
    },

    // Runs when the template is rendered
    parse: function (token, context, chain) {
      var output = getDataOne().global.svgSprite + token.stack[0].value

      return {
        chain: false,
        output: output
      }
    }
  })

  /**
   * Tag "url"
   * @output - empty
   */
  Twig.exports.extendTag({
    // unique name for tag type
    type: 'url',
    // regex match for tag (load white-space anything)
    regex: /^url\s+(.+)$/,
    // this is a standalone tag and doesn't require a following tag
    next: [ ],
    open: true,

    // Runs when the template is rendered
    parse: function (token, context, chain) {
      var output = ''

      return {
        chain: false,
        output: output
      }
    }
  })

  /**
   * Tag "csrf_token"
   * @output - empty
   */
  Twig.exports.extendTag({
    // unique name for tag type
    type: 'csrf_token',
    // regex match for tag (csrf_token white-space anything)
    regex: /^csrf_token$/,
    // this is a standalone tag and doesn't require a following tag
    next: [ ],
    open: true,

    // Runs when the template is rendered
    parse: function (token, context, chain) {
      var output = ''

      return {
        chain: false,
        output: output
      }
    }
  })
}

const htmlTask = () => {
  return gulp.src(paths.src)
    .pipe(data(getDataOne))
    .pipe(data(getData))
    .on('error', handleErrors)
    .pipe(twig({
      extend: twigExtends,
      filters: [
        {
          name: 'widows',
          func: function (str) {
            if (str !== undefined) {
              var wordArray = str.split(' ')
              var strMod = ''
              for (var i = 0; i < wordArray.length; i++) {
                if (i != wordArray.length - 1) {
                  if (wordArray[i].length == 1) strMod += (wordArray[i] + '&nbsp;')
                  else strMod += (wordArray[i] + ' ')
                } else {
                  strMod += wordArray[i]
                }
              }
              return strMod
            }
            return str
          }
        }
      ]
    }))
    .on('error', handleErrors)
    .pipe(gulp.dest(posix.join(global.production ? config.root.dist : '', paths.dest)))
    .pipe(gulpif(!global.production, browserSync.stream()))
}

gulp.task('html', htmlTask)
module.exports = htmlTask
