import { App } from 'vue'
export {}
declare global {
  type SrlDevToolsSettings = {
    active: boolean
    size: string
    position: string
    opacity: number
    darkMode: boolean
    overlay: {
      grid: boolean
    }
  }
  type SrlDevToolsDialog = null | "grid" | "settings" | "viewport"
  interface Window {
    app: App;
  }
}