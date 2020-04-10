import notify from 'gulp-notify'

module.exports = function (errorObject, callback) {
  notify.onError(errorObject).apply(this, arguments)
}
