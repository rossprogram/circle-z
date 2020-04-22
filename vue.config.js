// vue.config.js

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        appId: 'org.rossprogram.circle-z',
        copyright: 'Copyright © 2020, Jim Fowler.',
        productName: 'Circle Z',
        publish: 'github',
        mac: {
          category: 'public.app-category.education',
          icon: 'build/icons/icon.icns',
        },
        dmg: {
          background: 'build/background.png',
          contents: [
            {
              x: 135,
              y: 222,
            },
            {
              x: 405,
              y: 222,
              type: 'link',
              path: '/Applications',
            },
          ],
        },
        appImage: {
          license: 'LICENSE',
        },
        nsis: {
          createDesktopShortcut: 'always',
          license: 'LICENSE',
        },
      },
    },
  },
};
