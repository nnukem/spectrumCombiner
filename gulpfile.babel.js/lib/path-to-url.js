const path = require('path')

module.exports = (...args) => {
  // Normalizes Windows file paths to valid url paths
  return path.join.apply(this, args).replace(/\\/g, '/')
}
