const postcssPresetEnv = require('postcss-preset-env');
const flexGapPolyfill = require('flex-gap-polyfill');

module.exports = {
  plugins: [
    postcssPresetEnv(),
    flexGapPolyfill()
  ]
};
