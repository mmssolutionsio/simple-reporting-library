<script lang="ts" setup></script>

<template>
  <footer
    id="srl-page__footer"
    class="srl-bg-secondary-light srl-color-on-secondary-light"
    tabindex="-1"
  >
    <div class="srl-footer__inner">
      <div class="srl-footer__inner-navigation">
        <h2>Footernavigation</h2>
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
@use 'srl';

footer {
  min-height: srl.system-size-unit(60);
  padding: srl.system-size-unit(20) 0;

  .srl-footer {
    &__inner {
      margin: 0 auto;
      @include srl.grid-container();

      &-imprint {
        text-align: center;
      }
    }
  }

  @include srl.grid-media(print) {
    display: none;
  }
}
</style>
