<script lang="ts" setup>
import { MenuArticle, MenuExternal, MenuEntry } from '@/components/MenuItem'
import { computed, ref } from 'vue'
import useConfig from '@/composables/config'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const config = await useConfig()
const navigation = ref<NsWowMenu[]>([])

const currentMenus = computed<NsWowMenus>(() => {
  return config.value.menus[locale.value] ?? {}
})

function getLinkByPage(page: string): string {
  return `/${locale.value}/${page}`
}

if (currentMenus.value?.footer) {
  navigation.value = currentMenus.value.footer
}
</script>

<template>
  <footer class="srl-bg-secondary-light srl-color-on-secondary-light">
    <div class="srl-footer__inner">
      <div class="srl-footer__inner-navigation">
        <h2>Footernavigation</h2>
        <ul>
          <li v-for="(item, index) in navigation" :key="index">
            <MenuArticle
              v-if="item.type === 'Article'"
              :label="item.label"
              :page="getLinkByPage(<string>item.page)"
            />
            <MenuEntry v-if="item.type === 'MenuEntry'" :label="item.label" />
            <MenuExternal
              v-if="item.type === 'ExternalLink'"
              :label="item.label"
              :url="<string>item.url"
            />
          </li>
        </ul>
      </div>
      <div class="srl-footer__inner-imprint">
        <p>
          Made by<br /><a href="https://mmssolutions.io/" target="_blank">mms solutions</a> x
          <a href="https://www.multivisio.de/" target="_blank">MULTIVISIO</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use 'nswow';

footer {
  min-height: nswow.system-size-unit(60);
  padding: nswow.system-size-unit(20) 0;

  .srl-footer {
    &__inner {
      margin: 0 auto;
      @include nswow.grid-container();

      &-imprint {
        text-align: center;
      }

      &-navigation {
        ul {
          list-style-type: none;
          padding: 0 0 0 0;
          display: flex;
          gap: nswow.system-size-unit(10);
        }
      }
    }
  }

  @include nswow.grid-media(print) {
    display: none;
  }
}
</style>
