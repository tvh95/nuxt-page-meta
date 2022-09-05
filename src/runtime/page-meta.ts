import { defineNuxtPlugin, useHead, useRoute, useRuntimeConfig } from '#app'
import lodash from 'lodash'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const meta = global.metaData
    .filter(meta => (meta.match && new RegExp(meta.match).test(route.path)) || meta.path === route.path)
    .reduce((acc, cur) => lodash.merge(acc, cur.meta), [])

  if (!meta && meta.length > 0) { return }
  useHead({ meta })
})
