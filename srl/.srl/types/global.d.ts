import { App } from 'vue'
import { Plugin } from 'vite'
export {}
declare global {
  interface Window {
    app: App;
  }

  type Extension = {
    name: string;
    package: {
      name: string;
      path: string;
    };
    prepare?: () => Promise<void>;
    vitePlugin?: Plugin;
    vuePlugin?: (app: App) => void;
  }
}

declare module '../extensions.js' {
  const extensions: Extension[];
  export default extensions;
}