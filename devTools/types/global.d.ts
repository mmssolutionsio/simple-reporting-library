export {};
declare global {
  type SrlDevTools = typeof import('@multivisio/nswow/devTools/SrlDevTools.vue')['default']
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
}

interface _GlobalComponents {
  SrlDevTools: SrlDevTools;
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents extends _GlobalComponents {}
}