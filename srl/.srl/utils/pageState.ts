import { type Ref } from 'vue'

type DialogStorage = {
    [key: string]: Ref<SrlPageDialog>;
}

type PageState = {
    isMounted: boolean;
    dialogStorage: DialogStorage;
    accordionAnchored: boolean;
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

export function addDialogToStorage(uuid: string, refSrlPageDialog: Ref<SrlPageDialog>): void {
    pageState.dialogStorage[uuid] = refSrlPageDialog
}

export function getDialogFromStorage(uuid: string): SrlPageDialog | null {
    return isDialogStored(uuid)?
        pageState.dialogStorage[uuid].value : null
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

