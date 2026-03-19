import { settings } from '../settings.ts'
import { sizeOptions } from '../config.ts'

export  function wheelResizeHandler(e: WheelEvent) {
  if (!settings.value.active || !settings.value.mouseResize) return
  e.stopPropagation()
  e.preventDefault()
  const options = sizeOptions.value
  const currentIdx = options.indexOf(settings.value.size)
  if (e.deltaY > 0 && currentIdx < options.length - 1) {
    settings.value.size = options[currentIdx + 1]
  } else if (e.deltaY < 0 && currentIdx > 0) {
    settings.value.size = options[currentIdx - 1]
  }
}

export default {
  wheelResizeHandler,
}
