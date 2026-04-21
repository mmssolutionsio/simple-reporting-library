<script lang="ts" setup>
import { useGlobalLinks } from '@/composables/globalLinks.ts'
import { isDesktopView } from '@/composables/isDesktopView.ts'
import { ref, onMounted, nextTick, computed } from 'vue'
import { useMainNavigation } from '@/composables/mainNavigation.ts'
import SvgLogo from 'assets/images/logo.svg?component'
import SvgMenu from 'assets/images/menu.svg?component'

// Config
const animationDuration = ref(450) //450
const animationTimingFunction = ref("ease-out")
const backdropPadding = ref(64)

// Props
const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()

// Refs
const mainNavigation = ref<PageMainNavigation>()
const metaNavigation = ref<PageMetaNavigation>()
const mobileNavigation = ref<HTMLDivElement>()
const headerElement = ref<HTMLElement>()

// Data
const globalLinks = useGlobalLinks()
const backdropHeight = ref(0)
const animationAction = ref(false)

// Css variables
const animationDurationCss = computed(() => `${animationDuration.value}ms`)
const backdropPaddingCss = computed(() => `${backdropPadding.value}px`)
const backdropHeightCss = computed(() => `${backdropHeight.value}px`)
const backdropHeightNegativeCss = computed(() => `${-backdropHeight.value}px`)

const mobileNavigationOpen = ref<boolean>(false)
function mobileNavToggle() {
  if (mobileNavigationOpen.value) {
    animationTrigger(5)
    mobileNavigationOpen.value = false
    closeAllMenus()
  } else {
    animationTrigger()
    mobileNavigationOpen.value = true
    nextTick(() => {
      mobileNavigation.value?.focus()
    })
  }
}

function calcListHeight(list: HTMLUListElement) {
  let height = 0
  for (let x = 0; x < list.children.length; x++) {
    const child = list.children[x] as HTMLElement
    height += child.offsetHeight
  }
  return height
}

function animationTrigger(factor: number = 1) {
  animationAction.value = true
  setTimeout(() => {
    animationAction.value = false
  }, animationDuration.value * factor + 20)
}

function backdropState() {
  if (!isDesktopView.value && backdropHeight.value > 0) {
    backdropHeight.value = 0
  } else if (isDesktopView.value) {
    animationTrigger()
    nextTick(() => {
      if (mainNavigation.value) {
        let height = 0
        const menus = mainNavigation.value.menu?.$el?.querySelectorAll(
          '.srl-menu:not(.srl-menu--level-0):not([hidden])'
        )
        menus?.forEach((menu) => {
          const liHeight = calcListHeight(menu)
          if (liHeight > height) {
            height = liHeight
          }
        })
        backdropHeight.value = height ? height + backdropPadding.value * 2 : 0
      } else {
        backdropHeight.value = 0
      }
    })
  }
}

function closeAllMenus() {
  if (mainNavigation.value) {
    mainNavigation.value.menu?.closeAll()
  }
  if (metaNavigation.value) {
    metaNavigation.value.menu?.closeAll()
  }
  mobileNavigationOpen.value = false
  backdropState()
}

function focusMainNavigation() {
  if (!isDesktopView.value) {
    const elem = useMainNavigation()
    elem.value?.focus()
  }
}

function closeMobileNavigation(e: KeyboardEvent) {
  if (!isDesktopView.value) {
    e.preventDefault()
    closeAllMenus()
    focusMainNavigation()
  }
}

window.addEventListener('resize', () => {
  mobileNavigationOpen.value = false
  closeAllMenus()
})

function toggleMeta(data) {
  data.menuEl.classList.add('animate')
  setTimeout(() => {
    data.menuEl.classList.remove('animate')
  }, animationDuration.value)
}

function toggleMain(data) {
  if (data.opened) {
    setTimeout(() => {
      data.itemEl.parentElement.scrollTo({ top: 0, behavior: 'smooth' })
    }, animationDuration.value / 1.7)
  }
  data.itemEl.classList.add('animate')
  setTimeout(() => {
    data.itemEl.classList.remove('animate')
  }, animationDuration.value)
  metaNavigation.value.menu?.closeAll()
  backdropState()
}

onMounted(() => {
  const navMain = mainNavigation.value.menu.$el
  const navMain1 = navMain.querySelectorAll('.srl-menu--level-1')
  const navButtons = navMain.querySelectorAll('.srl-menu__link')

  navMain1.forEach((menu) => {
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllMenus()
        focusMainNavigation()
      }
    })
  })

  navMain.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllMenus()
      focusMainNavigation()
    }
  })

  navButtons.forEach((button) => {
    button.addEventListener('keydown', (event) => {
      if (button.classList.contains(
        isDesktopView.value?
          'srl-menu__link--level-1':
          'srl-menu__link--level-0')
        && event.key === 'Escape'
      ) {
        closeAllMenus()
        focusMainNavigation()
      }
    })
  });
  document.addEventListener('click', () => {
    closeAllMenus()
  })
})
</script>

<template>
  <header
    id="srl-page-header"
    ref="headerElement"
    class="srl-header"
    :class="{
      'mobile-nav-open': mobileNavigationOpen,
      'srl-header__animation': animationAction,
    }"
    tabindex="-1"
  >
    <div class="srl-header__toggle-container">
      <button
        type="button"
        id="srl-header__toggle"
        class="srl-button srl-button--icon srl-button--transparent-black srl-header__toggle"
        title="Menu"
        :hidden="isDesktopView"
        @click.stop="mobileNavToggle"
      >
        <span class="srl-header__menu-button-bar">
          <SvgMenu/>
        </span>
      </button>
    </div>
    <div class="srl-header__container">
      <router-link :to="globalLinks.home?.href" class="srl-logo">
        <SvgLogo class="srl-logo__img"/>
      </router-link>
      <div class="srl-header__navigation">
        <p class="srl-header__title" v-text="$t('page.title')" />
        <div
          ref="mobileNavigation"
          class="srl-header__mobile-navigation"
          tabindex="-1"
          :hidden="!isDesktopView && !mobileNavigationOpen"
          @keydown.esc="closeMobileNavigation"
          @keydown.exact.shift.tab="closeMobileNavigation"
          @click.stop
        >
          <PageMetaNavigation
            ref="metaNavigation"
            @toggle="toggleMeta"
            @routerChange="closeAllMenus"
            @focusMain="focusMainNavigation"
          />
          <PageMainNavigation
            ref="mainNavigation"
            :mainNavigation="props.mainNavigation"
            @toggle="toggleMain"
            @routerChange="closeAllMenus"
            @focusMain="focusMainNavigation"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss">
@use 'srl';

body:has(.mobile-nav-open) {
  overflow: hidden;
}

.srl-header {
  background-color: srl.colors-white-1000();
  color: srl.colors-grey-800();
  height: srl.system-root-style(srl-header-height);
  position: fixed;
  z-index: 1000;
  top: 0;
  right: 0;
  left: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);

  a, button {
    &:not(.srl-button) {
      color: srl.colors-grey-800();
    }
  }

  .srl-menu {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

.srl-header__container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  @include srl.spacer-column-gap(800);
  height: 100%;
  width: 100%;
  max-width: var(--srl-container-max-width);
  padding-inline: var(--srl-container-padding);
  margin: 0 auto;
}

.srl-header__title {
  @include srl.typography-title-h3();
}

.srl-header__toggle {
  position: absolute;
  top: srl.system-size-unit(12);
  right: var(--srl-container-padding);
}

.srl-header__toggle[hidden] {
  display: none;
}

.srl-header__toggle-container {
  position: relative;
  max-width: var(--srl-container-max-width);
  margin: 0 auto;
}

.srl-logo {
  width: srl.system-size-unit(110);
  height: auto;
  display: flex;
  align-items: center;
  position: relative;
}

.srl-main-navigation {
  max-width: var(--srl-container-max-width);
  margin: 0 auto;
  padding-inline: var(--srl-container-padding);

  .srl-menu__item {
    animation: fadeIn v-bind(animationDurationCss) v-bind(animationTimingFunction);
    margin: 0;
    padding: 0;
  }

  .srl-menu__link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include srl.spacer-column-gap(200);
    @include srl.typography-title-h4();
    text-decoration: none;
    border: 0;
    background-color: transparent;
    cursor: pointer;
    margin: 0;
    padding: 0 srl.spacer-get(200) 0 0;
    @include srl.spacer-padding-block(200);
    width: 100%;
    text-align: left;

    svg {
      transition: transform .3s v-bind(animationTimingFunction);
    }
  }

  .srl-menu__link:not(.srl-menu__link--back):hover {
    svg {
      transform: translateX(srl.spacer-get(200));
    }
  }

  .srl-menu__link--back {
    justify-content: flex-start;
  }
}

.srl-meta-navigation {
  @include srl.typography-button-text();
  height: srl.system-size-unit(68);
  display: flex;
  align-items: center;
  max-width: var(--srl-container-max-width);
  margin: 0 auto;
  padding-inline: var(--srl-container-padding);
  z-index: 100;

  > .srl-menu {
    display: flex;
    @include srl.spacer-gap(100);

    > .srl-menu__item {
      position: relative;
      &:has(.srl-menu:not([hidden])) {
        > .srl-button {
          border-bottom-right-radius: 0;
          border-bottom-left-radius: 0;
        }
      }

      .srl-menu {
        position: absolute;
        top: 100%;
        width: 100%;
        right: 0;
        animation-timing-function: ease-in-out;


        @keyframes headerDropDown {
          from {
            transform: translateY(-150px);
          }
          to {
            transform: translateY(0);
          }
        }

        &.animate {
          display: flex;
          overflow: hidden;
          z-index: -1;
          &[hidden] {
            > li {
              animation: headerDropDown calc(v-bind(animationDurationCss) / 2 ) v-bind(animationTimingFunction) reverse forwards;
            }
          }
          &:not([hidden]) {
            > li {
              animation: headerDropDown calc(v-bind(animationDurationCss) / 2 ) v-bind(animationTimingFunction) forwards;
            }
          }
        }

        .srl-menu__link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background-color: srl.colors-white-1000();
          border-color: srl.colors-grey-600();
          border-style: solid;
          border-width: 0 srl.system-size-unit(1) 0 srl.system-size-unit(1);
          text-align: center;
          text-decoration: none;
          height: srl.system-root-style(srl-button-height);

          &:last-child {
            border-bottom-width: srl.system-size-unit(1);
            border-bottom-right-radius: srl.system-root-style(srl-default-border-radius, 0);
            border-bottom-left-radius: srl.system-root-style(srl-default-border-radius, 0);
          }
        }
      }

      .srl-menu__item {
        width: 100%;
      }
    }
  }
}

@include srl.grid-media-down(phone-ls) {
.srl-header__title {
    display: none;
  }
}

@keyframes mobileNavOpen {
  from {
    height: 0;
  }
  to {
    height: calc(100dvh - srl.system-root-style(srl-header-height));
  }
}

@keyframes mobileNavClose {
  0% {
    height: calc(100dvh - srl.system-root-style(srl-header-height));
  }
  50% {
    height: calc(100dvh - srl.system-root-style(srl-header-height));
  }
  100% {
    height: 0;
  }
}

@include srl.grid-media-down(tablet-pt) {

  .srl-header__animation {
    .srl-header__mobile-navigation {
      display: flex;
      overflow: hidden;
      animation-timing-function: v-bind(animationTimingFunction);
    }

    .srl-header__mobile-navigation:not([hidden]) {
      animation-duration: calc(v-bind(animationDurationCss) / 2);
      animation-name: mobileNavOpen;
    }

    .srl-header__mobile-navigation[hidden] {
      animation-duration: calc(v-bind(animationDurationCss));
      animation-name: mobileNavClose;
    }
  }

  .srl-header__mobile-navigation {
    position: absolute;
    top: srl.system-root-style(srl-header-height);
    right: 0;
    width: 100%;
    height: 0;
    flex-direction: column;
    background-color: srl.colors-white-1000();
  }

  .srl-header__mobile-navigation:not([hidden]) {
    display: flex;
  }

  .mobile-nav-open {
    .srl-header__mobile-navigation {
        height: calc(100dvh - srl.system-root-style(srl-header-height));
      }
  }

  .srl-meta-navigation {
    flex: 0 0 auto;
    width: 100%;
    background-color: srl.colors-white-1000();
  }

  @keyframes mobileNavSubOpen {
    from {
      left: 100%;
    }
    to {
      left: 0;
    }
  }

  @keyframes mobileNavSubClose {
    from {
      display: block;
      left: 0;
    }
    to {
      left: 100%;
    }
  }

  .srl-main-navigation {
    flex: 1 1 auto;
    width: 100%;
    overflow: hidden;
    position: relative;
    max-width: unset;
    margin: 0;
    padding: 0;

    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 100%;
      max-height: calc(100dvh - srl.system-root-style(srl-header-height));
      transition: height v-bind(animationDurationCss) v-bind(animationTimingFunction);
      pointer-events: none;
      box-shadow:
        inset 0 32px 24px -14px srl.colors-white-1000(),
        inset 0 -32px 24px -14px srl.colors-white-1000();
    }

    .srl-menu {
      scroll-behavior: smooth;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: srl.colors-white-1000();
      overflow-y: auto;
      overflow-x: hidden;
      transition: left v-bind(animationDurationCss) v-bind(animationTimingFunction);
      @include srl.spacer-padding-block(200);
    }

    .srl-menu:has(.srl-menu:not([hidden])) {
      overflow-y: hidden;
    }

    .srl-menu__item {
      width: 100%;
      @include srl.grid-container();
      margin-inline: auto;
    }

    .srl-menu__item.animate {
      > .srl-menu:not([hidden]) {
        animation: mobileNavSubOpen v-bind(animationDurationCss) v-bind(animationTimingFunction) forwards;
      }
    }

    .srl-menu[hidden] {
      animation: mobileNavSubClose v-bind(animationDurationCss) v-bind(animationTimingFunction) forwards;
    }
  }
}

@include srl.grid-media-up(tablet-ls) {
  .srl-header {
    border-bottom: srl.system-size-unit(1) solid srl.colors-white-1000();
    transition: border-color calc(v-bind(animationDurationCss) * 2) v-bind(animationTimingFunction);
  }

  .srl-header__container {
    position: relative;
  }

  .srl-header__navigation {
    display: flex;
    flex-direction: column;
    justify-content: center;
    @include srl.spacer-row-gap(100);
    width: calc(100% - 530px);
  }

  .srl-header__animation {
    .srl-main-navigation {
      .srl-menu {
        scrollbar-width: none;
      }
    }
  }

  .srl-header:before {
    content: "";
    display: block;
    position: absolute;
    top: srl.system-root-style(srl-header-height);
    right: 0;
    left: 0;
    height: v-bind(backdropHeightCss);
    pointer-events: none;
    transition: height v-bind(animationDurationCss) v-bind(animationTimingFunction);
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
    background-color: srl.colors-white-1000();
  }

  .srl-header:has(.srl-main-navigation .srl-menu--level-1:not([hidden])) {
    border-color: srl.colors-grey-200();
  }

  .srl-header__mobile-navigation:after {
    content: "";
    display: block;
    position: absolute;
    top: srl.system-root-style(srl-header-height);
    right: 0;
    left: 0;
    height: v-bind(backdropHeightCss);
    max-height: calc(100dvh - srl.system-root-style(srl-header-height));
    transition: height v-bind(animationDurationCss) v-bind(animationTimingFunction);
    pointer-events: none;
    box-shadow:
      inset 0 64px 48px -28px srl.colors-white-1000(),
      inset 0 -64px 48px -28px srl.colors-white-1000();
  }

  .srl-meta-navigation {
    position: absolute;
    right: var(--srl-container-padding);
    top: 0;
    height: 100%;
    margin: 0;
    padding: 0;
    .srl-menu{
      animation-name: none;
    }
  }

  .srl-main-navigation {
    margin: 0;
    padding: 0;

    .srl-menu--level-0 {
      display: flex;
      @include srl.spacer-column-gap(200);

      .srl-menu {
        position: absolute;
        height: v-bind(backdropHeightCss);
        padding-block: v-bind(backdropPaddingCss);
        @include srl.spacer-padding-inline(200);
      }

      .srl-menu__link--level-0 {
        margin: 0;
        padding: 0;
        @include srl.typography-paragraph();
      }

      .srl-menu__item {
        animation-name: none;
      }

      .srl-menu__item--level-0:after {
        content: "";
        position: relative;
        display: block;
        height: srl.system-size-unit(2);
        top: srl.system-size-unit(21);
        background-color: transparent;
        margin-inline: auto;
        width: 100%;
        z-index: 10;
      }

      @keyframes firstLevelActiveOn {
        from {
          width: 0;
          background-color: transparent;
        }
        to {
          width: 100%;
          background-color: srl.colors-primary-1000();
        }
      }

      .srl-menu__item--level-0:has(> .srl-menu:not([hidden])):after,
      .srl-menu__item--level-0:has(.srl-menu__link[aria-current="page"]):after {
        background-color: srl.colors-primary-1000();
        animation: firstLevelActiveOn v-bind(animationDurationCss) v-bind(animationTimingFunction) forwards;
      }

    }

    .srl-menu--level-1 {
      top: srl.system-root-style(srl-header-height);
      left: srl.system-root-style(srl-container-padding);
      width: calc( 100% - srl.system-root-style(srl-container-padding, 0) * 2 );
      max-height: calc(100dvh - srl.system-root-style(srl-header-height));
      overflow-y: auto;
      transition: height v-bind(animationDurationCss) v-bind(animationTimingFunction);

      > .srl-menu__item {
        width: calc(33.333333% - srl.spacer-get(200));
      }

      .srl-menu {
        top: 0;
      }

      @keyframes headerRollDown {
        from {
          transform: translateY(v-bind(backdropHeightNegativeCss));
        }
        to {
          transform: translateY(0);
        }
      }

      @keyframes headerRollUp {
        from {
          z-index: -1;
          display: block;
          transform: translateY(0);
        }
        to {
          transform: translateY(v-bind(backdropHeightNegativeCss));
        }
      }

      .srl-menu:before {
        content: '';
        position: absolute;
        top: v-bind(backdropPaddingCss);
        left: srl.system-size-unit(-1);
        width: srl.system-size-unit(2);
        height: calc(v-bind(backdropHeightCss) - (v-bind(backdropPaddingCss) * 2));
        transition: height v-bind(animationDurationCss) v-bind(animationTimingFunction);
        animation: headerRollDown v-bind(animationDurationCss) v-bind(animationTimingFunction);
        background-color: srl.colors-grey-400();
      }

      .srl-menu__item {
        animation: headerRollDown v-bind(animationDurationCss) v-bind(animationTimingFunction);
      }

      .srl-menu[hidden] {
        animation: headerRollUp calc( v-bind(animationDurationCss) / 2 ) v-bind(animationTimingFunction);
      }

      .srl-menu__link {
        background-position: calc(100% - 40px) calc(50% - 3px);
      }
    }

    .srl-menu--level-2 {
      left: calc( 33.333333% + srl.system-size-unit(4) );
      width: calc( 66.666667% - srl.system-size-unit(4) );

      > .srl-menu__item {
        width: calc(50% - srl.spacer-get(200));
      }
    }

    .srl-menu--level-3 {
      left: 50%;
      width: 50%;

      > .srl-menu__item {
        width: calc(100% - srl.spacer-get(200));
      }
    }

    .srl-menu__link {
      @include srl.spacer-padding-block(100);
    }

    .srl-menu__item:has(> .srl-menu:not([hidden])) > .srl-menu__link,
    .srl-menu__link:hover {
      color: srl.colors-primary-1000();
    }

    .srl-menu__link-text--level-0 {
      white-space: nowrap;
    }

    .srl-menu__link--back {
      display: none;
    }
  }
}

@include srl.grid-media(tablet-ls) {
  .srl-meta-navigation {
    margin-block-start: srl.system-size-unit(6);
    align-items: flex-start;
    height: auto;
  }
}

</style>
