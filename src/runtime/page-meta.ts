import { defineNuxtPlugin, useHead, useRoute } from '#app'
import lodash from 'lodash'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const data = global.metaData
    .filter(meta => (meta.match && new RegExp(meta.match).test(route.path)) || meta.path === route.path)
    .reduce((acc, cur) => lodash.merge(acc, cur.meta), {})

  if (!data) { return }

  const meta = []
  if (data.keywords) { meta.push({ name: 'keywords', content: data.keywords }) }
  if (data.description) { meta.push({ name: 'description', content: data.description }) }

  useHead({ meta })
})
