module.exports = function (api) {
  api.cache(true);
  console.log("Babel config loaded");
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};