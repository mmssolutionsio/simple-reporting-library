<script setup lang="ts">
import { NGrid, NGridItem, NH2, NTable } from 'naive-ui'
import { useSrlConfig } from '#composables'
import { computed } from 'vue'

const srlConfig = useSrlConfig()

type SpacerItem = {
  name: string
  size: number | string
  alias: string | null
  only?: SpacerItemMedia[]
  up?: SpacerItemMedia[]
  down?: SpacerItemMedia[]
}

type SpacerItemMedia = {
  name: string
  size: number | string
}

const spacerView = computed<SpacerItem[]>(() => {
  const res = []
  for (const [key, item] of Object.entries(srlConfig.value.spacer.spacer)) {
    const i: SpacerItem = {
      name: key,
      size: item.size,
      alias: item.alias??null,
    }

    if (item.media) {
      for (const [media, value] of Object.entries(item.media)) {
        if (['up', 'down'].includes(media)) {
          for (const [m, s] of Object.entries(value as object)) {
            if (!i[media]) { i[media] = [] }
            i[media].push({
              name: m,
              size: s.size ?? s,
            })
          }
        } else {
          if (!i.only) { i.only = [] }
          i.only.push({
            name: media,
            size: value.size ?? value,
          })
        }
      }
    }

    res.push(i)
  }

  return res;
})

</script>

<template>
  <NGrid cols="1 s:2 m:3 l:4" responsive="screen" x-gap="20" y-gap="20">
    <NGridItem v-for="item in spacerView" :key="item.name">
      <NH2>
        {{item.name}}
        <template v-if="item.alias">( {{item.alias}} )</template>
      </NH2>
      <NTable striped>
        <tbody>
          <tr>
            <td v-text="'size'"/>
            <td colspan="2" v-text="typeof item.size === 'number' ? item.size + 'px / ' + (item.size / 16) + 'rem' : item.size" />
          </tr>
          <template v-if="item.only">
            <template v-for="(only, index) in item.only">
              <tr>
                <td class="v-top" v-if="index === 0" :rowspan="item.only.length" v-text="'only'"/>
                <td v-text="only.name"/>
                <td v-text="typeof only.size === 'number' ? only.size + 'px / ' + (only.size / 16) + 'rem' : only.size" />
              </tr>
            </template>
          </template>
          <template v-if="item.up">
            <template v-for="(up, index) in item.up">
              <tr>
                <td class="v-top" v-if="index === 0" :rowspan="item.up.length" v-text="'up'"/>
                <td v-text="up.name"/>
                <td v-text="typeof up.size === 'number' ? up.size + 'px / ' + (up.size / 16) + 'rem' : up.size" />
              </tr>
            </template>
          </template>
          <template v-if="item.down">
            <template v-for="(down, index) in item.down">
              <tr>
                <td class="v-top" v-if="index === 0" :rowspan="item.down.length" v-text="'down'"/>
                <td v-text="down.name"/>
                <td v-text="typeof down.size === 'number' ? down.size + 'px / ' + (down.size / 16) + 'rem' : down.size" />
              </tr>
            </template>
          </template>
        </tbody>
      </NTable>
    </NGridItem>

  </NGrid>
</template>

<style scoped lang="scss">
.v-top {
  vertical-align: top;
}
</style>