import srlConfig from "~/srl.config.json"
import { ref } from 'vue'

const config = ref(srlConfig)
export default function useSrlConfig() {
  return config
}