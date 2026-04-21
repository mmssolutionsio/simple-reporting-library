<script setup lang="ts">
import { useDownloads, useLocale } from '#composables'
import { computed } from 'vue'
import SvgDownload from 'assets/images/download.svg?component'

const downloads = useDownloads()
const locale = useLocale()

interface DownloadItem extends NsWowDownload {
  href?: string
}

type DownloadGroup = {
  title: string | null
  items: DownloadItem[]
}

const list = computed<DownloadGroup[]>(() => {
  const res: DownloadGroup[] = []
  let group: DownloadGroup = { title: null, items: [] }
  downloads.value.forEach((i) => {
    if (i.type === 'sectionTitle') {
      group = { title: i.title, items: [] }
      res.push(group)
    } else if (i.type === 'artifact') {
      const row = Object.assign(i)
      row.href = `./downloads/${locale.value}/${i.artifact}`
      !group || group.items.push(row)
    }
  })
  return res
})
</script>

<template>
  <div class="srl-download-center">
    <div v-for="(item, index) in list" :key="index" class="srl-download-center__inner">
      <h2 v-if="item.title" class="srl-grid srl-title-h2 srl-linkable">
        <span class="srl-grid__inner srl-title-h2__text">{{ item.title }}</span>
      </h2>

      <section class="srl-grid srl-download-center__section">
        <div class="srl-grid__inner">
          <div
            v-for="(file, fileIndex) in item.items"
            :key="fileIndex"
            class="srl-download-center__item"
          >
            <a class="srl-download-center__link" :href="file.href" download>
              <div class="srl-download-center__title-meta-container">
                <div class="srl-download-center__title">
                  <strong v-text="file.title" />
                </div>
                <div class="srl-download-center__meta">{{ file.fileType }} | {{ file.size }}</div>
              </div>
              <div class="srl-download-center__language-button-container">
                <span class="srl-download-center__language">{{ locale.toUpperCase() }}</span>
                <span class="srl-round-button">
                  <SvgDownload/>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
