module.exports = function (api) {
  api.cache(true);
  console.log("Babel config loaded");
  return {
    presets: [["babel-preset-expo"]],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@utils": "./src/utils",
            "@assets": "./src/assets",
            "@config": "./src/config",
            "@services": "./src/services",
          },
        },
      ],
      '@babel/plugin-transform-runtime',
      'react-native-reanimated/plugin' 
    ],
  };
};