<script setup lang="ts">
import { settings } from '../settings.ts'
import { NButton, NIcon } from 'naive-ui'
import { SettingsOutline, Eye, EyeOff } from '@vicons/ionicons5'

function toggleActive() {
  settings.value.active = !settings.value.active
}

const dialogContent = defineModel('dialogContent', {
  type: String as () => SrlDevToolsDialog,
  default: null
})

function dialogToggle(target: SrlDevToolsDialog) {
  dialogContent.value = dialogContent.value === target ? null : target
}
</script>

<template>

  <NButton
    v-if="settings.active"
    quaternary
    circle
    size="tiny"
    @click="dialogToggle('settings')"
  >
    <template #icon>
      <NIcon :component="SettingsOutline" />
    </template>
  </NButton>

  <NButton
    quaternary
    circle
    size="tiny"
    @click="toggleActive"
    :type="settings.active?'default':'error'"
  >
    <template #icon>
      <NIcon :component="settings.active?Eye:EyeOff" />
    </template>
  </NButton>

</template>

<style scoped lang="scss">

</style>