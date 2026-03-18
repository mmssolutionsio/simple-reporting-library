<script setup lang="ts">
import { config, sizeOptions } from '../config.ts'
import { settings } from '../settings.ts'

import { NSelect, NSlider, NSwitch, NTable, NText, NFlex } from 'naive-ui'
</script>

<template>

  <NTable>
    <tbody>
      <tr>
        <td>
          <NText strong>Dark Mode</NText>
        </td>
        <td>
          <NSwitch v-model:value="settings.darkMode" />
        </td>
      </tr>
      <tr>
        <td>
          <NText strong>Size</NText>
        </td>
        <td>
          <NSelect
            v-model:value="settings.size"
            size="small"
            :options="sizeOptions.map(s => ({ label: s, value: s }))"
          />
        </td>
      </tr>
      <tr>
        <td>
          <NText strong>Position</NText>
        </td>
        <td>
          <NSelect
            v-model:value="settings.position"
            size="small"
            :options="config.positions.map(p => ({ label: p, value: p }))"
          />
        </td>
      </tr>
      <tr>
        <td>
          <NText strong>Opacity</NText>
        </td>
        <td>
          <NFlex justify="center">
            <NText v-text="settings.opacity"/>
          </NFlex>
          <NSlider
            v-model:value="settings.opacity"
            :min="0.1"
            :max="1"
            :step="0.1"
          />
        </td>
      </tr>
    </tbody>
  </NTable>
</template>