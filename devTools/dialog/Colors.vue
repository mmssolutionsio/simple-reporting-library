<script setup lang="ts">
import { computed } from 'vue'
import { useSrlConfig } from '#composables'
import { NTable, NFlex } from 'naive-ui'

const srlConfig = useSrlConfig()
const colorView = computed(() => {
  return srlConfig.value.colors.colors
})
</script>

<template>
  <NTable striped>
    <tbody>
      <tr v-for="(item, i) in colorView" :key="i">
        <td v-text="item.name"/>
        <td>
          <NFlex>
            <div :style="{
              width: '30px',
              height: '30px',
              backgroundColor: item.color,
              border: '1px solid #00000020',
              borderRadius: '4px',
            }"/>
            {{ item.color }}
          </NFlex>
        </td>
        <td v-text="item.description ?? ''"/>
      </tr>
    </tbody>
  </NTable>
</template>