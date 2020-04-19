const { version } = require('../package.json')
const downloadDirectory = `${
  process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']
}/.rd-cli-template`

module.exports = {
  version,
  downloadDirectory,
}
