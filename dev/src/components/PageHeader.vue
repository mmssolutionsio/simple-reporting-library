<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const { locale } = useI18n()
const srlSearch = ref()
let searchValue = ref('')

function toggleSearchVisible() {
  srlSearch.value.classList.toggle('visible')
}

function search() {
  $router.push(`/${locale}/search?searchValue=${searchValue.value}`)
  toggleSearchVisible()
}
</script>

<template>
  <header class="srl-bg-primary srl-color-light">
    <div class="srl-header__inner">
      <router-link class="srl-header__inner-logo" :to="{ path: `/${locale}` }">
        <img :src="`@/assets/images/mms-logo-white.svg`" alt="logo" />
      </router-link>
      <div class="srl-header__inner-content">
        <div class="srl-header__inner-languages">
          <router-link :to="{ path: `/${locale}/downloads` }">
            <button class="srl-color-light">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-download"
                viewBox="0 0 16 16"
              >
                <path
                  d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                />
                <path
                  d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                />
              </svg>
            </button>
          </router-link>
          <button class="srl-color-light" @click="toggleSearchVisible">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
              />
            </svg>
          </button>
          <suspense>
            <LanguageSwitch />
          </suspense>
        </div>
      </div>
    </div>
    <div ref="srlSearch" class="srl-header__search">
      <input type="search" placeholder="Search ..." v-model="searchValue" @keyup.enter="search" />
    </div>
  </header>
</template>

<style scoped lang="scss">
@use 'nswow';

header {
  min-height: nswow.system-size-unit(60);
  padding: nswow.system-size-unit(10) 0;

  .srl-header {
    &__inner {
      margin: 0 auto;
      @include nswow.grid-container();
      @include nswow.grid-row();

      &-logo {
        height: nswow.system-size-unit(60);
        width: 100%;
        display: block;
        @include nswow.grid-col(4, phone);
        @include nswow.grid-col(3, portrait);
        @include nswow.grid-col(2, landscape);
        @include nswow.grid-col(2, desktop);

        img {
          height: 100%;
          max-width: 150px;
        }
      }

      &-languages {
        display: flex;
        justify-content: flex-end;
        min-height: nswow.system-size-unit(5);

        button {
          background: transparent;
          border: none;
          cursor: pointer;
          outline: none;
        }
      }

      &-content {
        @include nswow.grid-col(8, phone);
        @include nswow.grid-col(9, portrait);
        @include nswow.grid-col(10, landscape);
        @include nswow.grid-col(10, desktop);
      }
    }

    &__search {
      margin: 0 auto;
      height: 0;
      opacity: 0;
      overflow: hidden;
      transition: height 100ms linear;
      @include nswow.grid-container();

      &.visible {
        min-height: nswow.system-size-unit(40);
        opacity: 1;
      }

      input {
        width: 100%;
        height: 100%;
        border: nswow.system-size-unit(1) solid nswow.colors-light();
        padding: nswow.system-size-unit(5) nswow.system-size-unit(10);
      }
    }
  }

  @include nswow.grid-media(print) {
    display: none;
  }
}
</style>
