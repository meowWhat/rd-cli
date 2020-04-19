const path = require('path')
const { override, addLessLoader, addWebpackAlias } = require('customize-cra')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')

module.exports = {
  webpack: override(
    addLessLoader({
      javascriptEnabled: true,
      localIdentName: '[local]--[hash:base64:5]',
    }),
    addWebpackAlias({
      ['src']: path.resolve(__dirname, 'src/redark'),
      ['@rd']: path.resolve(__dirname, 'src/redark/UI/index.tsx'),
    }),
    (config) => {
      config.resolve.plugins = config.resolve.plugins.filter(
        (plugin) => !(plugin instanceof ModuleScopePlugin)
      )
      return config
    }
  ),
}
