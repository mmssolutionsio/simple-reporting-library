import { type Ref } from 'vue'

export type RefSrlPageDialog = Ref<SrlPageDialog | null>

type DialogStorage = {
  [key: string]: RefSrlPageDialog
}

type PageState = {
  isMounted: boolean
  dialogStorage: DialogStorage
  accordionAnchored: boolean
}

const pageState: PageState = {
  isMounted: false,
  dialogStorage: {},
  accordionAnchored: false,
}

export function usePageState() {
  return pageState;
}

export function setMounted(value: boolean): void {
  pageState.isMounted = value;
}

export function isMounted(): boolean {
  return pageState.isMounted;
}

export function clearPageState() {
  pageState.isMounted = false;
  pageState.dialogStorage = {};
  pageState.accordionAnchored = false;
}

export function isDialogStored(uuid: string): boolean {
  return uuid in pageState.dialogStorage
}

export function addDialogToStorage(uuid: string, refSrlPageDialog: RefSrlPageDialog): void {
  pageState.dialogStorage[uuid] = refSrlPageDialog
}

export function getDialogFromStorage(uuid: string): RefSrlPageDialog | null {
  return isDialogStored(uuid)?
    pageState.dialogStorage[uuid] : null
}

export function getDialogStorage() : DialogStorage {
  return pageState.dialogStorage
}

export function setAccordionAnchored(value: boolean): void {
  pageState.accordionAnchored = value;
}

export function isAccordionAnchored(): boolean {
  return pageState.accordionAnchored;
}
