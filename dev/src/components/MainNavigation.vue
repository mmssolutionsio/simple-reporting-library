<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useConfig from '@/composables/config'
import { MenuArticle, MenuEntry, MenuExternal } from '@/components/MenuItem'

const { locale } = useI18n()
const config = await useConfig()
const subNavigationVisible = ref<boolean>(false)
const activeSubmenu = ref<NsWowMenu[]>([])
const activeSubSubmenu = ref<NsWowMenu[]>([])

const currentMenus = computed(() => {
  return config.value.menus[locale.value] ?? {}
})

const currentMenu = computed(() => {
  const m = currentMenus.value.menuMain
  return m ?? []
})

const currentArticles = computed<NsWowArticle[]>(() => {
  return config.value.articles[locale.value] ?? []
})

function getLinkByPage(page: string): string {
  const currentPage = currentArticles.value.find((element) => element.uuid === page)
  return currentPage ? `/${locale.value}/${currentPage.slug}` : ''
}

function activateSubmenu(index: string | number): void {
  const menu = currentMenu.value[index]
  if (menu) {
    activeSubmenu.value = menu.submenuEntries ?? []

    if (!subNavigationVisible.value) {
      subNavigationVisible.value = !subNavigationVisible.value
    }
  }
}

function closeSubmenu() {
  subNavigationVisible.value = false
}
</script>

<template>
  <nav class="srl-navigation">
    <div class="srl-navigation__menuMain srl-bg-secondary-light">
      <div class="srl-navigation__menuMain-inner">
        <ul>
          <li
            class="srl-typo-copy1"
            v-for="(level1Item, level1ItemIndex) in currentMenu"
            :class="level1Item.type"
          >
            <MenuArticle
              v-if="level1Item.type === 'Article'"
              :label="level1Item.label"
              :page="getLinkByPage(<string>level1Item.page)"
              @click="closeSubmenu()"
            />
            <MenuEntry
              v-if="level1Item.type === 'MenuEntry'"
              :label="level1Item.label"
              @click="activateSubmenu(level1ItemIndex)"
            />
            <MenuExternal
              v-if="level1Item.type === 'ExternalLink'"
              :label="level1Item.label"
              :url="level1Item.url"
            />
          </li>
          <li
            class="srl-typo-copy1"
            v-if="subNavigationVisible"
            @click="subNavigationVisible = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-x-lg"
              viewBox="0 0 16 16"
            >
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
              />
            </svg>
          </li>
        </ul>
      </div>
    </div>

    <transition name="fade">
      <div class="srl-navigation__subNav srl-bg-secondary-light">
        <div class="srl-navigation__subNav-inner">
          <ul v-if="activeSubmenu.length && subNavigationVisible">
            <li class="srl-typo-copy1" v-for="(level2Item, level2ItemIndex) in activeSubmenu">
              <MenuArticle
                v-if="level2Item.type === 'Article'"
                :label="level2Item.label"
                :page="getLinkByPage(<string>level2Item.page)"
                @click="closeSubmenu()"
              />
              <MenuEntry v-if="level2Item.type === 'MenuEntry'" :label="level2Item.label" />
              <MenuExternal
                v-if="level2Item.type === 'ExternalLink'"
                :label="level2Item.label"
                :url="<string>level2Item.url"
              />

              <ul>
                <li
                  class="srl-typo-copy1"
                  v-for="(level3Item, index) in level2Item && level2Item.submenuEntries"
                >
                  <MenuArticle
                    v-if="level3Item.type === 'Article'"
                    :label="level3Item.label"
                    :page="getLinkByPage(<string>level3Item.page)"
                    @click="closeSubmenu()"
                  />
                  <MenuEntry v-if="level3Item.type === 'MenuEntry'" :label="level3Item.label" />
                  <MenuExternal
                    v-if="level3Item.type === 'ExternalLink'"
                    :label="level3Item.label"
                    :url="<string>level3Item.url"
                  />
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style lang="scss">
@use 'nswow';

.srl-navigation {
  &__menuMain,
  &__subNav {
    &-inner {
      margin: 0 auto;
      @include nswow.grid-container();

      ul {
        margin: 0 0 0 0;
        padding: 0 0 0 0;
        list-style-type: none;

        li {
          a {
            text-decoration: none;
          }
        }
      }
    }
  }

  &__menuMain {
    &-inner {
      ul {
        display: flex;
        align-items: center;
        gap: nswow.system-size-unit(20);

        li {
          position: relative;
          padding: nswow.system-size-unit(10) nswow.system-size-unit(20);
          cursor: pointer;

          &:hover {
            background: nswow.colors-primary();
            color: nswow.colors-light();
          }
        }
      }
    }
  }

  &__subNav {
    border-bottom: nswow.system-size-unit(1) solid nswow.colors-shade-800();

    &-inner {
      ul {
        display: flex;
        flex-direction: column;

        li {
          display: flex;
          align-items: center;
          position: relative;
          padding: nswow.system-size-unit(5) nswow.system-size-unit(20);
          cursor: pointer;
        }
      }
    }
  }

  @include nswow.grid-media(print) {
    display: none;
  }
}
</style>
