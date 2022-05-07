// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const path = require('path')

module.exports = {
  siteName: 'IHNM',
  icon: './src/assets/icons/dial.png',
  plugins: [
    {
      use: "gridsome-plugin-i18n",
      options: {
        locales: ['en', 'ru'],
        fallbackLocale: 'ru',
        defaultLocale: 'ru',
        messages: {
          "en": require("./src/locales/en.json"),
          "ru": require("./src/locales/ru.json"),
        }
      }
    }
  ],
  chainWebpack: config => {
    // dynamic image paths fix
    config.resolve.alias.set('@images', '@/assets/icons');
    // scss modules automatic import
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];
    types.forEach(type => addStyleResource(config.module.rule('scss').oneOf(type)));
  },
};

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/assets/variables.scss'),
      ],
    })
}
