// Do what you need to set up your test
console.log('setup test: vitest.setup.js');

// Chrome extension API mock
global.chrome = {
  i18n: {
    getMessage: key => key,
  },
  storage: {
    local: {
      get: () => Promise.resolve({}),
      set: () => Promise.resolve(),
    },
    onChanged: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  runtime: {
    getURL: path => path,
  },
};
