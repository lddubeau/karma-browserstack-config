module.exports = {
  extends: [
    "../.eslintrc.js",
  ],
  env: {
    node: true,
    mocha: true,
  },
  rules: {
    "max-lines-per-function": ["off", "describe blocks often fail this test."],
  },
};
