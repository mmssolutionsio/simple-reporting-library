<script setup lang="ts">
import { computed } from 'vue'
import { useSrlConfig } from '#composables'

import { NTable, NGrid, NGridItem, NH2 } from 'naive-ui'

const srlConfig = useSrlConfig()

type GridView = {
  name: string,
  columns: number,
  section: {
    from: number,
    to?: number
  },
  gap: {
    column: string | number,
    row: string | number
  },
  padding?: string | number,
  maxWidth?: string | number
}

const gridView = computed<GridView[]>(() => {
  const list = []
  const breakpoints = Object.keys(srlConfig.value.grid.breakpoints)
  breakpoints.forEach((breakpoint, index) => {
    const item: GridView = {
      name: breakpoint,
      columns: srlConfig.value.grid.columns[breakpoint],
      section: {
        from: srlConfig.value.grid.breakpoints[breakpoint],
      },
      gap: {
        column: 0,
        row: 0,
      }
    }

    if (breakpoints[(index + 1)]) {
      item.section.to = srlConfig.value.grid.breakpoints[breakpoints[(index + 1)]] - 1
    }

    if (srlConfig.value.grid.containers[breakpoint]['padding']) {
      item.padding = srlConfig.value.grid.containers[breakpoint]['padding']
    }

    if (srlConfig.value.grid.containers[breakpoint]['max-width']) {
      item.maxWidth = srlConfig.value.grid.containers[breakpoint]['max-width']
    }


    if (srlConfig.value.grid.gutter[breakpoint]['gap']) {
      item.gap.column = srlConfig.value.grid.gutter[breakpoint]['gap']
      item.gap.row = srlConfig.value.grid.gutter[breakpoint]['gap']
    } else {
      if (srlConfig.value.grid.gutter[breakpoint]['column-gap']) {
        item.gap.column = srlConfig.value.grid.gutter[breakpoint]['column-gap']
      }
      item.gap.row = srlConfig.value.grid.gutter[breakpoint]['row-gap']??item.gap.column
    }

    list.push(item)
  })
  return list
})

</script>

<template>
  <NGrid cols="1 s:2 m:3 l:4" responsive="screen" x-gap="20" y-gap="20">

    <NGridItem v-for="item in gridView" :key="item.name">
      <NH2 v-text="item.name"/>
      <NTable striped>
        <tbody>
          <tr>
            <td>columns</td>
            <td v-text="item.columns"/>
          </tr>
          <tr v-if="item.name !== 'print'">
            <td>from</td>
            <td v-text="item.section.from + 'px / ' + (item.section.from / 16) + 'rem'"/>
          </tr>
          <tr v-if="item.name !== 'print' && item.section.to">
            <td>to</td>
            <td v-text="item.section.to + 'px / ' + (item.section.to / 16) + 'rem'"/>
          </tr>
          <tr v-if="item.padding">
            <td>padding</td>
            <td v-text="typeof item.padding === 'number' ? item.padding + 'px / ' + (item.padding / 16) + 'rem' : item.padding"/>
          </tr>
          <tr v-if="item.maxWidth">
            <td>max-width</td>
            <td v-text="typeof item.maxWidth === 'number' ? item.maxWidth + 'px / ' + (item.maxWidth/ 16) + 'rem' : item.maxWidth"/>
          </tr>
          <tr>
            <td>column-gap</td>
            <td v-text="typeof item.gap.column === 'number' ? item.gap.column + 'px / ' + (item.gap.column / 16) + 'rem' : item.gap.column"></td>
          </tr>
          <tr>
            <td>row-gap</td>
            <td v-text="typeof item.gap.row === 'number' ? item.gap.row + 'px / ' + (item.gap.row / 16) + 'rem' : item.gap.row"></td>
          </tr>
        </tbody>
      </NTable>

    </NGridItem>

  </NGrid>
</template>
