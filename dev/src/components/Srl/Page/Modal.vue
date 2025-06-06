<script setup lang="ts">
import { nextTick, ref } from 'vue'

const content = ref<string | null>(null)
const state = ref<boolean>(false)

async function setContent(html: string) {
  content.value = html
  nextTick(open())
}

async function open() {
  state.value = true
}

function close() {
  state.value = false
}

defineExpose({
  setContent,
  open,
  close
})
</script>

<template>
  <div class="modal" :hidden="!state" :class="{ open: state }">
    <div class="background srl-bg-shade-200" @click="close" />
    <div class="content srl-bg-light srl-color-dark" @click.stop>
      <header>
        <button title="$t('buttons.close')" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!--!Font Awesome Pro 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2024 Fonticons, Inc.-->
            <path
              d="M64 64C46.3 64 32 78.3 32 96V416c0 17.7 14.3 32 32 32H448c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32H64zM0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm180.7 84.7c6.2-6.2 16.4-6.2 22.6 0L256 233.4l52.7-52.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L278.6 256l52.7 52.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L256 278.6l-52.7 52.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L233.4 256l-52.7-52.7c-6.2-6.2-6.2-16.4 0-22.6z"
            />
          </svg>
        </button>
      </header>
      <main v-html="content" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'nswow';

.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ease-out 0.5s;
  pointer-events: none;

  &.open {
    pointer-events: all;
    opacity: 1;
  }
}

header {
  button {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
    svg {
      width: 100%;
      height: 100%;
    }
  }
}

.background {
  position: fixed;
  inset: 0;
  z-index: 900;
}

.content {
  position: relative;
  width: 80%;
  min-height: 80%;
  max-height: 80%;
  border-radius: 20px;
  overflow: hidden;
  padding: 40px;
  z-index: 901;
}
</style>
