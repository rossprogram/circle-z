// vue.config.js
/*
      {
        test: /\.wasm$/,
        loader: 'file-loader',
        type: "javascript/auto"
      },
      {
        test: /\.dump.gz$/,
        loader: 'file-loader',
        type: "javascript/auto"
      },*/

module.exports = {
  pluginOptions: {
    electronBuilder: {
      // Chain webpack config for electron main process only
      chainWebpackMainProcess: (config) => {
        config.module
          .rule('dump.gz')
          .test(/\.dump.gz$/)
          .use('file-loader')
          .loader('file-loader')
          .end();
        config.module
          .rule('wasm')
          .test(/\.wasm$/)
          .type('javascript/auto')
          .use('file-loader')
          .loader('file-loader')
          .end();
        config.module
          .rule('cls')
          .test(/\.cls$/)
          .use('file-loader')
          .loader('file-loader')        
          .end();
        config.module
          .rule('mp3')
          .test(/\.mp3$/)
          .use('file-loader')
          .loader('file-loader')
          .end();

        //const wasmRule = config.module.rule('wasm');
        //wasmRule.uses.clear();

        // add replacement loader(s)
        //wasmRule
          //.use('file-loader')
          //.loader('file-loader')
          //.end();
      },
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        extraResources: [
          {
            from: './tex/',
            to: 'tex',
            filter: [
              '**/*',
            ],
          },
        ],
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
