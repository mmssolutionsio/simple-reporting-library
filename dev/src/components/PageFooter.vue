<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenu } from '#composables'
import SvgLogo from '@/assets/images/logo.svg?component'

const { t, te, tm } = useI18n()

type Contact = {
  label: string
  key: string
  title?: string
  href?: string
  linkText?: string
  attributes?: {
    [key: string]: string
  }
}

type SocialLink = {
  label: string
  href: string
  svg: any
}

const contact = computed<Contact[]>(() => {
  const c: Contact[] = []

  te('address.company')
    ? c.push({
        label: t('address.company'),
        key: 'company',
        attributes: {
          class: 'srl-bold'
        }
      })
    : null

  te('address.location') ? c.push({ label: t('address.location'), key: 'location' }) : null

  te('address.location2') ? c.push({ label: t('address.location2'), key: 'location2' }) : null

  te('address.city') ? c.push({ label: t('address.city'), key: 'city' }) : null

  te('address.country') ? c.push({ label: t('address.country'), key: 'country' }) : null

  if (te('address.phone')) {
    c.push({
      label: te('footer.phone') ? t('footer.phone') : '',
      key: 'phone',
      title: te('accessibility.callNumber') ? t('accessibility.callNumber') : t('address.phone'),
      linkText: t('address.phone'),
      href: `tel:${t('address.phone')}`
    })
  }

  if (te('address.fax')) {
    c.push({
      label: te('footer.fax') ? t('footer.fax') : '',
      key: 'fax',
      title: te('accessibility.callFax') ? t('accessibility.callFax') : t('address.fax'),
      linkText: t('address.fax'),
      href: `fax:${t('address.fax')}`
    })
  }

  if (te('address.email')) {
    c.push({
      label: te('footer.email') ? t('footer.email') : '',
      key: 'email',
      title: te('accessibility.sendEmail') ? t('accessibility.sendEmail') : t('address.email'),
      linkText: t('address.email', { interpolation: { escapeValue: false } }),
      href: `mailto:${t('address.email', { interpolation: { escapeValue: false } })}`
    })
  }
  return c
})

const socialLinks = computed<NsWowNavigationItem[]>(() => {
  const links = []

  if (
    te('socialMedia.linkedIn') ||
    te('socialMedia.xing') ||
    te('socialMedia.twitter') ||
    te('socialMedia.facebook') ||
    te('socialMedia.instagram')
  ) {
    const socialMedia = tm('socialMedia') as Record<string, string>

    Object.entries(socialMedia).forEach(([key, value]) => {
      if (key === 'linkedIn') {
        links.push({
          label: 'LinkedIn',
          href: value,
          icon: 'linkedin-in',
          attributes: {
            'aria-label': 'LinkedIn',
            title: 'LinkedIn',
            class: 'srl-button srl-button--icon srl-button--transparent-white'
          }
        })
      }

      if (key === 'xing') {
        links.push({
          label: 'Xing',
          href: value,
          icon: 'xing',
          attributes: {
            'aria-label': 'Xing',
            title: 'Xing',
            class: 'srl-button srl-button--icon srl-button--transparent-white'
          }
        })
      }
      if (key === 'twitter') {
        links.push({
          label: 'Twitter',
          href: value,
          icon: "x-twitter",
          attributes: {
            'aria-label': 'Twitter',
            title: 'Twitter',
            class: 'srl-button srl-button--icon srl-button--transparent-white'
          }
        })
      }
      if (key === 'facebook') {
        links.push({
          label: 'Facebook',
          href: value,
          icon: "facebook-f",
          attributes: {
            'aria-label': 'Facebook',
            title: 'Facebook',
            class: 'srl-button srl-button--icon srl-button--transparent-white'
          }
        })
      }
      if (key === 'instagram') {
        links.push({
          label: 'Instagram',
          href: value,
          icon: "instagram",
          attributes: {
            'aria-label': 'Instagram',
            title: 'Instagram',
            class: 'srl-button srl-button--icon srl-button--transparent-white'
          }
        })
      }
    })
  }
  return links
})

const furtherLinks = useMenu('footerFurtherLinks')

const downloads = useMenu('footerDownloads')

const downloadMenu = computed(() => {
  return downloads.value.map((item) => {
    if (item.href?.endsWith('.pdf')) {
      item.attributes = {
        download: ''
      }
    }
    return item
  })
})

const meta = ref([]) //useMenu('footerMeta')

const navigationMeta = computed(() => {
  return [
    ...meta.value,
    {
      label: t('footer.privacySettings'),
      callback: () => alert('Privacy settings callback')
    }
  ]
})

const date = new Date()
const year = ref(date.getFullYear())
</script>

<template>
  <footer id="srl-page-footer" class="srl-footer" tabindex="-1">
    <div class="srl-footer__inner">
      <div class="srl-footer__head">
        <p class="srl-footer__logo">
          <SvgLogo />
        </p>
        <div v-if="socialLinks.length && $te('footer.followUs')" class="srl-footer__social">
          <h2 v-text="$t('footer.followUs')" class="srl-footer__social-header" />
          <nav class="srl-footer__social-nav" :aria-label="$t('footer.followUs')">
            <SrlMenu name="socialLinks" :menu="socialLinks" />
          </nav>
        </div>
      </div>
      <div class="srl-footer__content">
        <section v-if="contact.length">
          <h2 v-text="$t('footer.contact')" id="footer-contact" />
          <address class="srl-footer__address">
            <template v-for="(cont, index) in contact" :key="cont.label">
              <span :class="`srl-footer__${cont.key}`" v-bind="cont.attributes ?? {}">
                <template v-if="cont.href">
                  {{ cont.label }}<a :href="cont.href" :title="cont.title">{{ cont.linkText }}</a>
                </template>
                <template v-else>
                  {{ cont.label }}
                </template>
              </span>
              <template v-if="index < contact.length - 1">
                <br />
              </template>
            </template>
          </address>
        </section>
        <section v-if="downloads.length">
          <h2 v-text="$t('footer.downloads')" id="footer-downloads" />
          <nav aria-labelledby="footer-downloads">
            <SrlMenu name="downloads" :menu="downloadMenu" class="srl-footer__link-list" />
          </nav>
        </section>
        <section v-if="furtherLinks.length">
          <h2 v-text="$t('footer.furtherLinks')" id="footer-further-links" />
          <nav aria-labelledby="footer-further-links">
            <SrlMenu name="furtherLinks" :menu="furtherLinks" class="srl-footer__link-list" />
          </nav>
        </section>
      </div>
      <div class="srl-footer__meta">
        <nav v-if="navigationMeta.length" aria-label="Meta">
          <SrlMenu name="meta" :menu="navigationMeta" />
        </nav>
        <p v-if="$te('footer.copyright')" v-text="$t('footer.copyright', { year: year })" />
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use 'srl';

footer {
  background-color: srl.colors-grey-800();

  color: srl.colors-white-1000();

  :deep(a:not(.srl-button)),
  :deep(button:not(.srl-button)) {
    @include srl.typography-paragraph();
    margin: unset;
    padding: unset;
    background-color: transparent;
    border: none;
    text-decoration: none;
    cursor: pointer;
    color: srl.colors-white-1000();
  }

  section {
    display: flex;
    flex-direction: column;
    @include srl.spacer-row-gap(400);
    width: 100%;
  }

  :deep(.srl-footer__link-list) {
    display: flex;
    flex-direction: column;
    row-gap: srl.system-size-unit(10);
  }

  h2 {
    @include srl.typography-title-h3();
  }
}

.srl-footer {
  &__inner {
    @include srl.typography-paragraph();
    margin: 0 auto;
    max-width: var(--srl-container-max-width);
    padding-inline: var(--srl-container-padding);
    @include srl.spacer-padding-top(800);
    @include srl.spacer-padding-bottom(800);
    display: flex;
    flex-direction: column;
    @include srl.spacer-row-gap(800);
  }

  &__head {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  &__logo {
    width: srl.system-size-unit(175);
  }

  &__social {
    display: flex;
    @include srl.spacer-gap(100);
    justify-content: center;
    align-items: center;

    &-header {
      @include srl.typography-paragraph();
    }

    &-nav {
      .srl-menu {
        display: flex;
        align-items: center;
        @include srl.spacer-gap(100);
      }
    }
  }

  &__content {
    display: flex;
    flex-wrap: wrap;
    @include srl.spacer-column-gap(400);
    @include srl.spacer-row-gap(400);
    width: 100%;
  }

  &__address {
    font-style: normal;
  }

  &__meta {
    display: flex;
    @include srl.spacer-row-gap(400);
    flex-direction: column;

    :deep(a:not(.srl-button)),
    :deep(button:not(.srl-button)) {
      text-decoration: underline;
    }

    :deep(ul) {
      display: flex;
      align-items: baseline;
      gap: srl.spacer-get(400);

      @include srl.grid-media-up(tablet-pt) {
        @include srl.spacer-column-gap(400);
        flex-direction: row;
      }
    }

    :deep(a:not(.srl-button)),
    :deep(button:not(.srl-button)),
    :deep(p) {
      @include srl.typography-link();
    }
  }
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

@include srl.grid-media(print) {
  footer {
    display: none;
  }
}

@include srl.grid-media-up(tablet-pt) {
  footer {
    section {
      width: srl.system-size-unit(300);
    }
  }

  .srl-footer {
    &__head {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }
  }
}

@include srl.grid-media-up(tablet-ls) {
  .srl-footer {
    &__meta {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
      align-items: baseline;
    }
  }
}
</style>
