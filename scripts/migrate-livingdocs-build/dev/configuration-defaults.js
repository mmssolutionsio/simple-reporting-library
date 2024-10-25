const configurationDefaults = {
  configurationSelector: '[type="ld-conf"]',
  build: {
    design: './livingdocs.config.json',
    components: './livingdocs/**/*.html',
    requiredFolders: ['./.output/ldd/assets'],
    dist: './.output/livingdocs',
    dest: './',
    archiveName: './.output/livingdocs.zip',
  },
  migration: {
    design: './livingdocs.config.json',
    components: './livingdocs/**/*.html',
    dest: './design-v2',
  },
};

export default configurationDefaults;
