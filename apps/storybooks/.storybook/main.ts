import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  refs: (_, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        react: {
          title: 'React',
          url: 'http://localhost:6007',
        },
        // Add future adapter Storybooks here as new framework adapters are created:
        // vue: { title: 'Vue', url: 'http://localhost:6008' },
        // angular: { title: 'Angular', url: 'http://localhost:6009' },
        // svelte: { title: 'Svelte', url: 'http://localhost:6010' },
      };
    }
    // Static build: relative paths to co-deployed child static builds
    return {
      react: {
        title: 'React',
        url: '../react-storybook',
      },
      // vue: { title: 'Vue', url: '../vue-storybook' },
    };
  },
};

export default config;
