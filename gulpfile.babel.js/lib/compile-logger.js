import log from 'fancy-log'
import chalk from 'chalk'
import PluginError from 'plugin-error'
import handleErrors from './handle-errors'

module.exports = (err, stats) => {
  if (err) throw new PluginError('webpack', err)

  if (stats.compilation.errors.length > 0) {
    stats.compilation.errors.forEach((error) => {
      handleErrors(error)
    })
  } else {
    log(chalk.green(stats))
  }
}
