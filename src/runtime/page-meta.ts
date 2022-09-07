import { defineNuxtPlugin, useHead, useRoute, useNuxtApp } from '#app'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const meta = global.metaData
    ?.filter(meta => (meta.match && new RegExp(meta.match).test(route.path)) || meta.path === route.path)
    ?.reduce((acc, cur) => {
      acc.push(...cur.meta)
      return acc
    }, [])

  if (!meta || meta.length < 1) { return }
  useHead({ meta })
})
