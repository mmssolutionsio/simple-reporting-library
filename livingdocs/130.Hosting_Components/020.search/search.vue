<script setup lang="ts">
import { useSearch, useLocale } from '#composables'
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onMounted, ref } from 'vue'
import ButtonDefault from '@/components/Button/Default.vue'
import { useGlobalLinks } from '@/composables/globalLinks.ts'
import SvgSearch from 'assets/images/search.svg?component'


const props = withDefaults(defineProps<{
  searchMinLength?: number | string
  charsAround?: number | string
  wordsDistance?: number | string
  useAutoSearch?: boolean | string
  delayAutoSearch?: number | string
  useMoreResults?: boolean | string
  countMoreResults?: number | string
}>(), {
  searchMinLength: 3,
  charsAround: 50,
  wordsDistance: 50,
  useAutoSearch: false,
  delayAutoSearch: 700,
  useMoreResults: false,
  countMoreResults: 10
})

/**
 * Search component configuration
 */
const searchMinLength = typeof props.searchMinLength === 'string' ?
  parseInt(props.searchMinLength) : props.searchMinLength
const charsAround = typeof props.charsAround === 'string' ?
  parseInt(props.charsAround) : props.charsAround
const wordsDistance = typeof props.wordsDistance === 'string' ?
  parseInt(props.wordsDistance) : props.wordsDistance
const useAutoSearch = typeof props.useAutoSearch === 'string' ?
  props.useAutoSearch === 'true' : props.useAutoSearch
const delayAutoSearch = typeof props.delayAutoSearch === 'string' ?
  parseInt(props.delayAutoSearch) : props.delayAutoSearch
const useMoreResults = typeof props.useMoreResults === 'string' ?
  props.useMoreResults === 'true' : props.useMoreResults
const countMoreResults = ref(
  typeof props.countMoreResults === 'string' ?
    parseInt(props.countMoreResults) : props.countMoreResults
)

/**
 * Search component logic
 */
const locale = useLocale()
const router = useRouter()
const route = useRoute()
const globalLinks = useGlobalLinks()
const isLoading = ref<boolean>(true)
const searchContext = await useSearch()
const searchInit = ref<boolean>(false)
const currentMoreResults = ref<number>(
  window.sessionStorage.currentMoreResults ?
    parseInt(window.sessionStorage.currentMoreResults) :
    countMoreResults.value
)
const buttonMoreResults = ref<HTMLButtonElement>()
let searchTimer: NodeJS.Timeout | null = null

const searchInput = ref<HTMLInputElement>()
route.query.s ?
  window.sessionStorage.currentSearchTerm = route.query.s?.toString() :
  !window.sessionStorage.currentSearchTerm ?
    window.sessionStorage.currentSearchTerm = "" :
    null

!window.sessionStorage.currentMoreResults ?
  window.sessionStorage.currentMoreResults = currentMoreResults.value.toString() :
  null

const searchValue = ref<string>(window.sessionStorage.currentSearchTerm)
const arrSearchText = computed<string[]>(() => {
  return searchValue.value
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w)
})
const lastSearchValue = ref<string>(searchValue.value)
const searchResult = ref(startSearch())
const searchResultRows = ref<HTMLAnchorElement[]>()

function getBoldStyle() {
  return "<b>$1</b>";
}

function applyStyle(style, text, words) {
  const wordExpr = words.length > 1 ? words.join("|") : words[0];
  const out = text.replace(new RegExp(`(${wordExpr})`, "gi"), style);
  return out;
}

function extractWords(ranges) {
  return ranges
    .flat(2)
    .reduce(
      (acc, next) => (acc.includes(next.word) || acc.push(next.word), acc),
      []
    );
}

function postProcessResults({ length, texts, ranges }) {
  let searchText = "";
  let autocompText = "";

  if (length > 0 && ranges.filter( r => r.index !== -1).length > 0) {
    const text = texts.join(" ");
    const words = extractWords(ranges);

    searchText = text;

    autocompText = true
      ? applyStyle(getBoldStyle(), text, words)
      : text;
  }

  return [{
    searchText: searchText,
    autocompText: autocompText,
  }];
}

function fetchResults(texts: string, words: string[]) {
  if (texts.length == 0) return { length: 0 };

  const ranges = findRanges(texts, words);
  const outTexts = extractRange(texts, ranges)

  return {
    texts: outTexts,
    length: outTexts.length,
    ranges,
  };
}

function createIndexes(text: string, words: string[]) {
  const createIndex = (text: string, word: string) => {
    return {
      index: text.search(new RegExp(word, "gi")),
      word: word,
    };
  };

  /*We sort words indexes from lower to higher*/
  return words
    .map((word) => createIndex(text, word))
    .sort((a, b) => a.index - b.index);
}

function findRanges(text: string, words: string[]) {
  const indexes = createIndexes(text, words);
  let ranges = [];
  let range = [];

  indexes.map((index, i) => {
    if (range.length == 0) return range.push(indexes[i]);

    if (range[0].index + wordsDistance > indexes[i].index)
      return range.push(indexes[i]);

    ranges.push(range);
    range = [indexes[i]];
  });

  if (range.length) ranges.push(range);

  return ranges;
}


function extractRange(text, ranges) {
  const texts = ranges.map((range) => {
    // debugger
    const first = range[0];
    const last = range.length == 1 ? first : range[range.length - 1];

    return extractText(text, first, last);
  });

  return texts;
}

function extractText(text, rangeFirst, rangeLast) {
  const startIndex = rangeFirst.index - charsAround;
  const lastIndex = rangeLast.index + charsAround;
  const leftPad = startIndex > 0 ? "..." : "";
  const rightPad = lastIndex < text.length ? "..." : "";

  return leftPad + text.substring(startIndex, lastIndex) + rightPad;
}

function createResult(foundedParts, pageItem) {
  if (!foundedParts) return null;

  return {
    pageItem: pageItem,
    page: pageItem.slug,
    foundedTexts: foundedParts,
  };
}

function startSearch() {
  const res = []
  if (searchValue.value.length >= searchMinLength) {
    const filterContext = searchContext.value.filter((i) => {
      return arrSearchText.value.every((w) => new RegExp(w, "gi").test(i.words))
        || new RegExp(searchValue.value, "gi").test(i.article.translatedTitle)
    })

    filterContext.forEach(page => {
      const fetchRes = fetchResults(page.words, arrSearchText.value)
      const postResult = postProcessResults(fetchRes)
      let myResult = {
        pageItem: page.article,
        page: page.article.slug,
        foundedTexts: postResult
      }
      res.push(myResult)
    })
  }
  return res
}

startSearch()

function keyStartSearch(event: KeyboardEvent) {
  if (useAutoSearch) {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
      triggerSearch()
    }, delayAutoSearch)
    if (event.key === "Enter") {
      focusResult(0)
    }
  } else {
    if (event.key === "Enter") {
      triggerSearch()
      if (searchResult.value.length) {
        router.push({
          ...route,
          query: {
            s: searchValue.value
          }
        })
      }
    }
  }
}

function submitSearch() {
  if (useAutoSearch) {
    focusResult(0)
  } else {
    triggerSearch()
    if (searchResult.value.length) {
      router.push({
        ...route,
        query: {
          s: searchValue.value
        }
      })
    }
  }
}

function triggerSearch() {
  isLoading.value = true
  searchInit.value = true
  searchResult.value = []
  searchResult.value = startSearch()
  searchResult.value.length ? lastSearchValue.value = searchValue.value : null
  window.sessionStorage.currentSearchTerm = lastSearchValue.value
  resetMoreResults()
  isLoading.value = false
}

function escapeHtml(html) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return html.replace(/[&<>"']/g, (char) => map[char]);
}

function focusResult(index: number) {
  const item = searchResultRows.value?.[index]
  !item || item.focus()
}

function nextResult(index: number) {
  const treshhold = !useMoreResults ?
    searchResult.value.length :
    searchResult.value.length < currentMoreResults.value ?
      searchResult.value.length :
      currentMoreResults.value

  let newIndex = index >= treshhold - 1 ? 0 : index + 1
  buttonMoreResults.value && newIndex === 0 ?
    buttonMoreResults.value.focus() :
    focusResult(newIndex)
}

function prevResult(index: number) {
  let newIndex = index <= 0 ? searchResult.value.length - 1 : index - 1
  buttonMoreResults.value && newIndex === searchResult.value.length - 1 ?
    buttonMoreResults.value.focus() :
    focusResult(newIndex)
}

async function clickResult(index: number, href: string) {
  setWindowState(index)
  router.push({
    path: href,
  }).then(() => {
    const mainElement: HTMLDivElement | null = document.querySelector('#srl-page-main')
    if (mainElement) {
      nextTick(() => {
        setTimeout(() => {
          mainElement.scrollTo({
            top: 16,
            behavior: 'instant'
          })
          mainElement.focus()
        },700)
      })
    }
  })
}

function resetMoreResults() {
  currentMoreResults.value = countMoreResults.value
  window.sessionStorage.currentMoreResults = currentMoreResults.value
}

function increaseMoreResults() {
  const index = currentMoreResults.value
  currentMoreResults.value += countMoreResults.value
  window.sessionStorage.currentMoreResults = currentMoreResults.value
  nextTick(() => {
    focusResult(index)
  })
}

onMounted(() => {
  if (
    window.history.state.currentSearchResult !== undefined &&
    window.history.state.currentSearchResult !== -1 &&
    searchResultRows.value?.length &&
    searchResultRows.value[window.history.state.currentSearchResult]
  ) {
    focusResult(window.history.state.currentSearchResult)
  } else {
    searchInput.value?.focus()
  }
})

function setWindowState(index: number) {
  window.history.state.currentSearchResult = index
}

</script>

<template>
  <div class="srl-search__wrap">
    <div class="srl-grid srl-search-form">
      <div class="srl-grid__inner">
        <div class="srl-search-form__group">
          <label for="search" class="srl-search-form__label">
            {{$t('accessibility.searchLabel')}}
          </label>
          <input
            id="search"
            ref="searchInput"
            type="text"
            class="srl-search-form__input"
            :placeholder="$t('search.placeholder')"
            aria-label="Search"
            v-model="searchValue"
            @keydown="keyStartSearch"
            @focus="setWindowState(-1)"
          />
          <button
            tabindex="-2"
            class="srl-button srl-button--icon"
            type="button"
            :aria-label="$t('search.search')"
            @click="submitSearch"
          >
            <i class="srl-icon-search"/>
          </button>
        </div>
      </div>
    </div>

    <div v-if="searchResult.length" class="srl-grid srl-search-results">
      <div class="srl-grid__inner">
        <h2 class="srl-title-h2 srl-search-results__main-title">
          <span class="srl-title-h2__number-text-container">
            <span class="srl-title-h2__text" v-text="$t('search.resultCount', { count: searchResult.length, text: lastSearchValue })" />
          </span>
        </h2>
        <nav
          class="srl-search-results__nav"
          tabindex="-1"
          @keydown.stop.prevent.up="focusResult(0)"
          @keydown.stop.prevent.right="focusResult(0)"
          @keydown.stop.prevent.down="focusResult(0)"
          @keydown.stop.prevent.left="focusResult(0)"
          @keydown.stop.prevent.esc="focusResult(0)"
        >
          <ul class="srl-search-results__list">
            <template v-for="(item, index) in searchResult" :key="index">
              <li v-if="!useMoreResults || currentMoreResults > index" class="srl-search-results__item">
                <a
                  ref="searchResultRows"
                  :href="`./${locale}/${item.pageItem.slug}`"
                  class="srl-search-results__link"
                  @click.prevent.stop="clickResult(index, `/${locale}/${item.pageItem.slug}`)"
                  @keydown.stop.prevent.up="prevResult(index)"
                  @keydown.stop.prevent.right="nextResult(index)"
                  @keydown.stop.prevent.down="nextResult(index)"
                  @keydown.stop.prevent.left="prevResult(index)"
                  @keydown.stop.prevent.esc="searchInput?.focus()"
                  @keydown.stop.prevent.enter="clickResult(index, `/${locale}/${item.pageItem.slug}`)"
                  @keydown.stop.prevent.space="clickResult(index, `/${locale}/${item.pageItem.slug}`)"
                >
                  <h3 class="srl-search-results__title">
                    {{ item.pageItem.translatedTitle }}
                  </h3>
                  <p
                    v-for="(text, textIndex) in item.foundedTexts"
                    :key="textIndex"
                    class="srl-search-results__snippet"
                    v-html="text.autocompText"
                  />
                </a>
              </li>
            </template>
          </ul>
        </nav>
        <div v-if="useMoreResults && currentMoreResults < searchResult.length" class="srl-grid srl-search-load-more">
          <div class="srl-grid__inner">
            <div class="srl-button-container">
              <div class="srl-button-container__inner">
                <button
                  ref="buttonMoreResults"
                  type="button"
                  class="srl-button"
                  :aria-label="$t('search.showMoreResults')"
                  @click="increaseMoreResults"
                  @keydown.stop.prevent.up="focusResult( currentMoreResults - 1 )"
                  @keydown.stop.prevent.right="focusResult( currentMoreResults - 1 )"
                  @keydown.stop.prevent.down="focusResult(0)"
                  @keydown.stop.prevent.left="focusResult(0)"
                  @keydown.stop.prevent.esc="searchInput?.focus()"
                >
                  <i class="srl-button__icon" aria-hidden="true"></i>
                  <span class="srl-button__text" v-text="$t('search.showMoreResults')" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="searchResult.length === 0 && searchInit" class="srl-search-results">
      <div class="srl-grid srl-lead srl-mt-200">
        <p class="srl-grid__inner srl-lead__text srl-linkable">
          {{$t('search.noResultsMessage')}}
        </p>
      </div>
    </div>
  </div>
</template>
