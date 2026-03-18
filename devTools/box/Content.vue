<script setup lang="ts">
import BoxPanel from '../components/BoxPanel.vue'
import { useViewPort } from '#composables'
import { settings } from '../settings.ts'

import { NButton, NIcon, NText } from 'naive-ui'
import { InformationCircleOutline, Eye, EyeOff } from '@vicons/ionicons5'

const viewPort = useViewPort()

const dialogContent = defineModel('dialogContent', {
  type: String as () => SrlDevToolsDialog,
  default: null
})

function dialogToggle(target: SrlDevToolsDialog) {
  dialogContent.value = dialogContent.value === target ? null : target
}

</script>

<template>
    <BoxPanel label="Grid">

      <NButton
        quaternary
        circle
        size="tiny"
        @click="dialogToggle('grid')"
      >
        <template #icon>
          <NIcon :component="InformationCircleOutline" />
        </template>
      </NButton>

      <NButton
        quaternary
        circle
        size="tiny"
        @click="settings.overlay.grid=!settings.overlay.grid"
        :type="settings.overlay.grid?'success':'error'"
      >
        <template #icon>
          <NIcon :component="settings.active?Eye:EyeOff" />
        </template>
      </NButton>

    </BoxPanel>
    <BoxPanel label="ViewPort">

      <NButton
        quaternary
        circle
        size="tiny"
        @click="dialogToggle('viewport')"
      >
        <template #icon>
          <NIcon :component="InformationCircleOutline" />
        </template>
      </NButton>

    </BoxPanel>
    <NText tag="div" v-text="viewPort.viewPort" :title="`currentViewPort:\n${viewPort.viewPort}`"/>
    <NText tag="div" v-text="`w: ${viewPort.innerWidth}px`" :title="`window.innerWidth\n${viewPort.innerWidth}px`"/>
</template>