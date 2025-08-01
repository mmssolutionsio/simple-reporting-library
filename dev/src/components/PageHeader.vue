<script lang="ts" setup>
import NavLanguages from '@/components/NavLanguages.vue'
import { useLocale } from '#composables'

const locale = useLocale()
</script>

<template>
  <header id="srl-page-header" class="srl-header" tabindex="-1">
    <div class="srl-header__container">
      <router-link :to="`/${locale}`" class="srl-logo">
        <img class="srl-logo__img" src="@/assets/images/mms-logo-white.svg" alt="MMS Solutions" />
      </router-link>
    </div>
    <NavLanguages />
  </header>
</template>

<style lang="scss">
@use 'srl';

.srl-header {
  background-color: srl.colors-primary-1000();
  display: flex;
  justify-content: center;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: var(--srl-container-max-width);
    padding-inline: var(--srl-container-padding);
  }
}

.srl-logo {
  display: block;
  width: 300px;
}
</style>
