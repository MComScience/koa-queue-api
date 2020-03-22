module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true
  },

  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2018
  },

  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error"
  }
}
