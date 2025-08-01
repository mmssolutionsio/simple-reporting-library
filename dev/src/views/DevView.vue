<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import Autoload from '@/Autoload.ts'
import { useRoute } from 'vue-router'

const articleRoot = ref<HTMLDivElement | null>(null)

const route = useRoute()

onMounted(() => {
  nextTick(() => {
    Autoload.init(articleRoot.value)
    if (route.hash) {
      const target = document.querySelector(route.hash)
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
  })
})
</script>

<template>
  <article ref="articleRoot" class="srl-article-root">
    <h1 class="srl-grid srl-title-h1 srl-linkable">
      <span class="srl-grid__inner srl-title-h1__text" doc-editable="title-h1">
        Title h1 Lorem ipsum dolor sit amet
      </span>
    </h1>

    <div class="srl-grid srl-lead">
      <p class="srl-grid__inner srl-lead__text srl-linkable" doc-editable="lead">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste sapiente, magni incidunt aut
        hic ut sint, repellendus nesciunt alias sequi, vero voluptatem! Similique laborum natus eum
        ullam, rem officiis dolores.
      </p>
    </div>

    <p class="srl-grid srl-paragraph srl-linkable">
      <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
        kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </span>
    </p>

    <h2 class="srl-grid srl-title-h2 srl-linkable">
      <span class="srl-grid__inner srl-title-h2__number-text-container js-notes-marker">
        <span class="srl-title-h2__number js-notes-marker-number">1</span>
        <span class="srl-title-h2__text js-notes-marker-text">
          Title h2 Lorem ipsum dolor sit amet
        </span>
      </span>
    </h2>
    <p class="srl-grid srl-paragraph srl-linkable">
      <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
        kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </span>
    </p>

    <h3 class="srl-grid srl-title-h3 srl-linkable">
      <span class="srl-grid__inner srl-title-h3__number-text-container js-notes-marker">
        <span class="srl-title-h3__number js-notes-marker-number"> 1.1. </span>
        <span class="srl-title-h3__text js-notes-marker-text">
          Title h3 Lorem ipsum dolor sit amet
        </span>
      </span>
    </h3>

    <p class="srl-grid srl-paragraph srl-linkable">
      <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
        kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </span>
    </p>

    <h4 class="srl-grid srl-title-h4 srl-linkable">
      <span class="srl-grid__inner srl-title-h4__number-text-container js-notes-marker">
        <span class="srl-title-h4__number js-notes-marker-number"> 1.1.1. </span>
        <span class="srl-title-h4__text js-notes-marker-text">
          Title h4 Lorem ipsum dolor sit amet
        </span>
      </span>
    </h4>

    <p class="srl-grid srl-paragraph srl-linkable">
      <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
        kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </span>
    </p>

    <div class="srl-grid srl-list-group srl-list-group--ul">
      <ul class="srl-grid__inner srl-list-group__list srl-list-group__list--ul">
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
      </ul>
    </div>

    <p class="srl-grid srl-paragraph srl-linkable">
      <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
        kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </span>
    </p>

    <div class="srl-grid srl-list-group srl-list-group--ol">
      <ol class="srl-grid__inner srl-list-group__list srl-list-group__list--ol">
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
      </ol>
    </div>

    <p class="srl-grid srl-paragraph srl-linkable">
      <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
        kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </span>
    </p>

    <div class="srl-grid srl-list-group srl-list-group--alphanumeric">
      <ol class="srl-grid__inner srl-list-group__list srl-list-group__list--ol">
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
        <li class="srl-list-group__item">
          <span class="srl-list-group__item-text srl-linkable"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </li>
      </ol>
    </div>

    <div class="srl-grid srl-footnote srl-linkable">
      <div class="srl-grid__inner srl-footnote__inner">
        <div class="srl-footnote__item">
          <span class="srl-footnote__number">
            <sup doc-editable="footnote-number">1</sup>
          </span>
          <span class="srl-footnote__text" doc-editable="footnote-text">Footnote</span>
        </div>
        <div class="srl-footnote__item">
          <span class="srl-footnote__number">
            <sup doc-editable="footnote-number">2</sup>
          </span>
          <span class="srl-footnote__text" doc-editable="footnote-text"
            >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            <strong>invidunt</strong> ut labore et dolore magna aliquyam erat, sed diam
            voluptua.</span
          >
        </div>
      </div>
    </div>

    <figure class="srl-image">
      <div class="srl-grid srl-grid--media">
        <div class="srl-grid__inner srl-image__image-container srl-image__image-container--desktop">
          <img
            class="srl-image__img srl-image__img--desktop"
            src="/images/placeholder-1.jpg"
            loading="lazy"
            data-alt-text-target="alt"
          />
        </div>
        <div
          class="srl-grid__inner srl-image__image-container srl-image__image-container--mobile"
          doc-toggle="show-mobile-image"
          data-remove-from-pdf="complete"
        >
          <img
            class="srl-image__img srl-image__img--mobile"
            doc-image="mobile-image"
            data-alt-text-target="alt"
          />
        </div>
      </div>
      <figcaption class="srl-grid srl-image__caption srl-linkable" doc-toggle="show-caption">
        <span class="srl-image__caption-text" doc-editable="image-caption">
          Write an image caption here (optional)
        </span>
      </figcaption>
    </figure>

    <h2 class="srl-grid srl-title-h2 srl-linkable">
      <span
        class="srl-grid__inner srl-title-h2__number-text-container js-notes-marker"
        data-category-marker="container"
      >
        <span
          class="srl-title-h2__number js-notes-marker-number"
          data-category-marker="number"
          doc-optional
          doc-editable="title-h2-number"
        >
          1
        </span>
        <span
          class="srl-title-h2__text js-notes-marker-text"
          data-category-marker="text"
          doc-editable="title-h2-text"
        >
          Title h2 Lorem ipsum dolor sit amet
        </span>
      </span>
    </h2>
    <div class="srl-grid srl-aside-content-container">
      <div class="srl-grid__aside srl-aside-content-container__aside" doc-container="aside">
        <p class="srl-grid srl-paragraph srl-linkable">
          <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </span>
        </p>
      </div>
      <div class="srl-grid__content srl-aside-content-container__content" doc-container="content">
        <p class="srl-grid srl-paragraph srl-linkable">
          <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
            aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
            rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
            amet.
          </span>
        </p>
        <p class="srl-grid srl-paragraph srl-linkable">
          <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
            aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
            rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
            amet.
          </span>
        </p>
        <p class="srl-grid srl-paragraph srl-linkable">
          <span class="srl-grid__inner srl-paragraph__text" doc-editable="paragraph">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
            aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
            rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
            amet.
          </span>
        </p>
      </div>
    </div>

    <h2 class="srl-grid srl-title-h2 srl-linkable">
      <span
        class="srl-grid__inner srl-title-h2__number-text-container js-notes-marker"
        data-category-marker="container"
      >
        <span
          class="srl-title-h2__number js-notes-marker-number"
          data-category-marker="number"
          doc-optional
          doc-editable="title-h2-number"
        >
          1
        </span>
        <span
          class="srl-title-h2__text js-notes-marker-text"
          data-category-marker="text"
          doc-editable="title-h2-text"
        >
          Title h2 Lorem ipsum dolor sit amet
        </span>
      </span>
    </h2>
    <div class="srl-table">
      <div class="srl-table__container">
        <div data-tableid="Vorlage">
          <div class="srl-table-container ns-table-container">
            <table class="srl-table-tab040 ns-table-tab040">
              <thead>
                <tr class="head">
                  <th class="srl-horizontal-left ns-horizontal-left head" scope="col">
                    <p><span>Lorem ipsum de</span></p>
                  </th>
                  <th class="srl-horizontal-right ns-horizontal-right head notes_group" scope="col">
                    <p><span>Anhang</span></p>
                  </th>
                  <th
                    class="srl-horizontal-right ns-horizontal-right head srl-background-05 ns-background-05"
                    scope="col"
                  >
                    <p><span>2024</span></p>
                  </th>
                  <th class="srl-horizontal-right ns-horizontal-right head" scope="col">
                    <p><span>2023</span></p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="title">
                  <td class="srl-horizontal-left ns-horizontal-left title">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right title srl-background-05 ns-background-05"
                  >
                    <p>
                      <span></span>
                    </p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title">
                    <p><span></span></p>
                  </td>
                </tr>
                <tr>
                  <td class="srl-horizontal-left ns-horizontal-left">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right notes_group">
                    <p><span class="srl-number">1</span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">100.8</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right">
                    <p><span class="srl-number">131.5</span></p>
                  </td>
                </tr>
                <tr>
                  <td class="srl-horizontal-left ns-horizontal-left">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right notes_group">
                    <p><span class="srl-number">3</span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">0.4</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right">
                    <p><span class="srl-number">0.7</span></p>
                  </td>
                </tr>
                <tr class="bold">
                  <td class="srl-horizontal-left ns-horizontal-left bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">10.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold">
                    <p><span class="srl-number">9.1</span></p>
                  </td>
                </tr>
                <tr class="blinebottom_bold">
                  <td class="srl-horizontal-left ns-horizontal-left blinebottom_bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right blinebottom_bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">136.6</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold">
                    <p><span class="srl-number">126.1</span></p>
                  </td>
                </tr>
                <tr class="title">
                  <td class="srl-horizontal-left ns-horizontal-left title">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right title srl-background-05 ns-background-05"
                  >
                    <p>
                      <span></span>
                    </p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title">
                    <p><span></span></p>
                  </td>
                </tr>
                <tr class="ind">
                  <td class="srl-horizontal-left ns-horizontal-left ind">
                    <p><span> Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind notes_group">
                    <p><span class="srl-number">1</span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right ind srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">559.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind">
                    <p><span class="srl-number">523.2</span></p>
                  </td>
                </tr>
                <tr class="ind_ind">
                  <td class="srl-horizontal-left ns-horizontal-left ind_ind">
                    <p><span> Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind_ind notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right ind_ind srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">438.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind_ind">
                    <p><span class="srl-number">402.2</span></p>
                  </td>
                </tr>
                <tr class="bold">
                  <td class="srl-horizontal-left ns-horizontal-left bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">752.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold">
                    <p><span class="srl-number">711.6</span></p>
                  </td>
                </tr>
                <tr class="blinebottom_bold">
                  <td class="srl-horizontal-left ns-horizontal-left blinebottom_bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right blinebottom_bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">949.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold">
                    <p><span class="srl-number">947.4</span></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="srl-footnote-container ns-footnote-container">
            <p class="srl-footnote ns-footnote">
              <span class="srl-footnote__key ns-footnote__key">1</span
              ><span class="srl-footnote__text ns-footnote__text"
                >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
                tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</span
              >
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="srl-table srl-wide-width">
      <div class="srl-table__container">
        <div data-tableid="Vorlage">
          <div class="srl-table-container ns-table-container">
            <table class="srl-table-tab040 ns-table-tab040">
              <thead>
                <tr class="head">
                  <th class="srl-horizontal-left ns-horizontal-left head" scope="col">
                    <p><span>Lorem ipsum de</span></p>
                  </th>
                  <th class="srl-horizontal-right ns-horizontal-right head notes_group" scope="col">
                    <p><span>Anhang</span></p>
                  </th>
                  <th
                    class="srl-horizontal-right ns-horizontal-right head srl-background-05 ns-background-05"
                    scope="col"
                  >
                    <p><span>2024</span></p>
                  </th>
                  <th class="srl-horizontal-right ns-horizontal-right head" scope="col">
                    <p><span>2023</span></p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="title">
                  <td class="srl-horizontal-left ns-horizontal-left title">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right title srl-background-05 ns-background-05"
                  >
                    <p>
                      <span></span>
                    </p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title">
                    <p><span></span></p>
                  </td>
                </tr>
                <tr>
                  <td class="srl-horizontal-left ns-horizontal-left">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right notes_group">
                    <p><span class="srl-number">1</span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">100.8</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right">
                    <p><span class="srl-number">131.5</span></p>
                  </td>
                </tr>
                <tr>
                  <td class="srl-horizontal-left ns-horizontal-left">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right notes_group">
                    <p><span class="srl-number">3</span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">0.4</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right">
                    <p><span class="srl-number">0.7</span></p>
                  </td>
                </tr>
                <tr class="bold">
                  <td class="srl-horizontal-left ns-horizontal-left bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">10.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold">
                    <p><span class="srl-number">9.1</span></p>
                  </td>
                </tr>
                <tr class="blinebottom_bold">
                  <td class="srl-horizontal-left ns-horizontal-left blinebottom_bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right blinebottom_bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">136.6</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold">
                    <p><span class="srl-number">126.1</span></p>
                  </td>
                </tr>
                <tr class="title">
                  <td class="srl-horizontal-left ns-horizontal-left title">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right title srl-background-05 ns-background-05"
                  >
                    <p>
                      <span></span>
                    </p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right title">
                    <p><span></span></p>
                  </td>
                </tr>
                <tr class="ind">
                  <td class="srl-horizontal-left ns-horizontal-left ind">
                    <p><span> Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind notes_group">
                    <p><span class="srl-number">1</span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right ind srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">559.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind">
                    <p><span class="srl-number">523.2</span></p>
                  </td>
                </tr>
                <tr class="ind_ind">
                  <td class="srl-horizontal-left ns-horizontal-left ind_ind">
                    <p><span> Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind_ind notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right ind_ind srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">438.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right ind_ind">
                    <p><span class="srl-number">402.2</span></p>
                  </td>
                </tr>
                <tr class="bold">
                  <td class="srl-horizontal-left ns-horizontal-left bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">752.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right bold">
                    <p><span class="srl-number">711.6</span></p>
                  </td>
                </tr>
                <tr class="blinebottom_bold">
                  <td class="srl-horizontal-left ns-horizontal-left blinebottom_bold">
                    <p><span>Lorem ipsum de</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold notes_group">
                    <p><span></span></p>
                  </td>
                  <td
                    class="srl-horizontal-right ns-horizontal-right blinebottom_bold srl-background-05 ns-background-05"
                  >
                    <p><span class="srl-number">949.2</span></p>
                  </td>
                  <td class="srl-horizontal-right ns-horizontal-right blinebottom_bold">
                    <p><span class="srl-number">947.4</span></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="srl-footnote-container ns-footnote-container">
            <p class="srl-footnote ns-footnote">
              <span class="srl-footnote__key ns-footnote__key">1</span
              ><span class="srl-footnote__text ns-footnote__text"
                >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
                tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</span
              >
            </p>
          </div>
        </div>
      </div>
    </div>
    <figure class="srl-image srl-wide-width">
      <div class="srl-grid srl-grid--media">
        <div class="srl-grid__inner srl-image__image-container srl-image__image-container--desktop">
          <img
            class="srl-image__img srl-image__img--desktop"
            src="/images/placeholder-2.jpg"
            loading="lazy"
            data-alt-text-target="alt"
          />
        </div>
        <div
          class="srl-grid__inner srl-image__image-container srl-image__image-container--mobile"
          doc-toggle="show-mobile-image"
          data-remove-from-pdf="complete"
        >
          <img
            class="srl-image__img srl-image__img--mobile"
            doc-image="mobile-image"
            data-alt-text-target="alt"
          />
        </div>
      </div>
      <figcaption class="srl-grid srl-image__caption srl-linkable" doc-toggle="show-caption">
        <span class="srl-image__caption-text" doc-editable="image-caption">
          Write an image caption here (optional)
        </span>
      </figcaption>
    </figure>
    <figure class="srl-image srl-full-width">
      <div class="srl-grid srl-grid--media">
        <div class="srl-grid__inner srl-image__image-container srl-image__image-container--desktop">
          <img
            class="srl-image__img srl-image__img--desktop"
            src="/images/placeholder-3.jpg"
            loading="lazy"
            data-alt-text-target="alt"
          />
        </div>
        <div
          class="srl-grid__inner srl-image__image-container srl-image__image-container--mobile"
          doc-toggle="show-mobile-image"
          data-remove-from-pdf="complete"
        >
          <img
            class="srl-image__img srl-image__img--mobile"
            doc-image="mobile-image"
            data-alt-text-target="alt"
          />
        </div>
      </div>
      <figcaption class="srl-grid srl-image__caption srl-linkable" doc-toggle="show-caption">
        <span class="srl-image__caption-text" doc-editable="image-caption">
          Write an image caption here (optional)
        </span>
      </figcaption>
    </figure>

    <div class="srl-grid srl-signature">
      <div class="srl-grid__inner srl-signature__content">
        <div class="srl-signature__item">
          <img class="srl-signature__img" src="/images/signature-1.png" />
          <p class="srl-signature__name">Max Mustermann</p>
          <p class="srl-signature__position">Position</p>
        </div>
        <div class="srl-signature__item">
          <img class="srl-signature__img" src="/images/signature-2.png" />
          <p class="srl-signature__name">Max Mustermann</p>
          <p class="srl-signature__position">Position</p>
        </div>
      </div>
    </div>
  </article>
</template>
