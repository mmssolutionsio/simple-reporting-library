import useConfig from '@/composables/config'
import generateKFCJson from '@/components/SrlPage/KFCApplication/services/xlsxParser'

export default async function useKfcData() {
  const config = await useConfig()
  /** @todo überprüfen warum die daten nicht korrekt mit config.value.settings.languages generiert werden */
  //return await generateKFCJson(config.value.settings.languages);
  return await generateKFCJson(['de', 'en', 'fr', 'it'])
}
