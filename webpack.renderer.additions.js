module.exports = {
  module: {
    rules: [{
      test: /\.(jsx?|tsx?|vue)$/,
      enforce: 'pre',
      exclude: /node_modules|src/,
      loader: 'eslint-loader',
    }],
  },
};
