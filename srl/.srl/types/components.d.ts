export {}
declare global {}
interface _GlobalComponents {}
declare module '@vue/runtime-core' {
  export interface GlobalComponents extends _GlobalComponents {}
}
