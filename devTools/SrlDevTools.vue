<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { config } from './config.ts'
import { settings } from './settings.ts'
import Content from './components/Content.vue'
import DialogSettings from './dialog/Settings.vue'
import DialogViewPort from './dialog/ViewPort.vue'
import DialogGrid from './dialog/Grid.vue'
import DialogSpacer from './dialog/Spacer.vue'
import DialogColors from './dialog/Colors.vue'
import PanelContent from './panel/Content.vue'
import BoxContent from './box/Content.vue'
import { useViewPort, useSrlConfig } from '#composables'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NModal,
  NCard,
  NFlex,
  NDivider,
  darkTheme,
  deDE,
  dateDeDE
} from 'naive-ui'

const viewPort = useViewPort()

const srlConfig = useSrlConfig()

const dialogContent = ref<SrlDevToolsDialog>(null)

const fontSize = ref(12);

watch(
  settings.value,
  (newSettings) => {
    fontSize.value = config.value.fontSizes[newSettings.size]
  },
  { immediate: true }
)

const fontSizeTypo = computed(() => {
  return `${fontSize.value}px`
})

const isDark = computed(() => Boolean(settings.value.darkMode))
const naiveTheme = computed(() => (isDark.value ? darkTheme : null))

const mainClasses = computed(() => {
  const c = [];
  c.push(settings.value.position)
  return c
})

const mainStyles = computed(() => {
  return {
    fontSize: fontSizeTypo.value
  }
})

const gridColumnCount = computed(() => {
  return  srlConfig.value.grid.columns[viewPort.value.viewPort]
})

const showDialog = computed(() => dialogContent.value !== null)

const dialogTitle = computed(() => {
  switch (dialogContent.value) {
    case 'settings':
      return 'Settings'
    case 'viewport':
      return 'Viewport'
    case 'grid':
      return 'Grid'
    case 'spacer':
      return 'Spacer'
    case 'colors':
      return 'Colors'
    default:
      return ''
  }
})

const dialogCardStyle = computed(() => {
  if (dialogContent.value === 'grid') {
    return { width: 'min(80vw, 1200px)' }
  }
  if (dialogContent.value === 'spacer') {
    return { width: 'min(80vw, 1200px)' }
  }
  return { width: 'min(520px, 92vw)' }
})

function closeDialog() {
  dialogContent.value = null
}
</script>

<template>
  <NConfigProvider
    :theme="naiveTheme"
    :locale="deDE"
    :date-locale="dateDeDE"
  >
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <div class="dev-tools" :style="mainStyles" :class="mainClasses">
            <teleport to="body">
              <div v-if="settings.overlay.grid" class="dev-tools__overlay">
                <div class="dev-tools__overlay--grid">
                  <div v-for="i in gridColumnCount" :key="i"></div>
                </div>
              </div>
            </teleport>

            <div class="dev-tools__box">
              <NCard
                size="small"
                :bordered="false"
                class="dev-tools__box-card"
                content-style="padding: 6px"
              >
                <NFlex justify="end" align="center" :wrap="false" style="gap: 6px">
                  <PanelContent v-model:dialogContent="dialogContent" />
                </NFlex>

                <template v-if="settings.active">
                  <NDivider style="margin: 6px 0" />
                  <BoxContent v-model:dialogContent="dialogContent" />
                </template>
              </NCard>
            </div>

            <NModal
              v-model:show="showDialog"
              :mask-closable="true"
              :auto-focus="false"
              :trap-focus="false"
              :block-scroll="false"
              @close="closeDialog"
              @mask-click="closeDialog"
              @esc="closeDialog"
            >
              <NCard
                class="dev-tools__naive-dialog"
                :style="dialogCardStyle"
                :bordered="false"
                :segmented="{ content: true }"
                :title="dialogTitle"
                closable
                @close="closeDialog"
              >

                <Content>
                  <DialogSettings v-if="dialogContent==='settings'" />
                  <DialogViewPort v-if="dialogContent==='viewport'" />
                  <DialogGrid v-if="dialogContent==='grid'" />
                  <DialogSpacer v-if="dialogContent==='spacer'" />
                  <DialogColors v-if="dialogContent==='colors'" />
                </Content>
              </NCard>
            </NModal>
          </div>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped lang="scss">
@use "srl" as srl;

.dev-tools {
  font-family: 'Segoe UI', 'Arial', 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-weight: normal;
  letter-spacing: 0.05em;

  /* Positionierung der Box (minimal CSS, Rest kommt aus Naive UI) */
  &__box {
    position: fixed;
    z-index: 3000;
  }

  &.top-right .dev-tools__box { top: 0; right: 0; }
  &.top-left .dev-tools__box { top: 0; left: 0; }
  &.bottom-right .dev-tools__box { bottom: 0; right: 0; }
  &.bottom-left .dev-tools__box { bottom: 0; left: 0; }

  /* Breitenlimit, damit die Box klein bleibt */
  &__box-card {
    width: max-content;
    max-width: min(92vw, 420px);
    font-size: 11px;
    line-height: 1.2;
  }

  /* Dialog-Inhalte ebenfalls etwas kleiner */
  :deep(.dev-tools__naive-dialog) {
    max-height: min(70vh, 720px);
    overflow: hidden;
    font-size: 12px;
    line-height: 1.25;
  }

  :deep(.dev-tools__naive-dialog .n-card__content) {
    max-height: min(70vh, 720px);
    overflow: auto;
  }

  &__overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1900;
    overflow: hidden;

    &--grid {
      @include srl.grid-container();
      @include srl.grid-row();
      height: 100dvh;
      margin-inline: auto;
      & > div {
        background-color: rgba(255, 0, 0, 0.05);
        height: 100%;
      }
    }
  }
}
</style>


