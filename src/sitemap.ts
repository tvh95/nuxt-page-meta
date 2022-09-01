import { writeFileSync } from 'fs'
import { createResolver } from '@nuxt/kit'
import { NuxtPage } from '@nuxt/schema'
import dayjs from 'dayjs'
import pug from 'pug'

const lastMod = dayjs().format('YYYY-MM-DD')

async function generateSitemap (
  domain: string,
  nuxtPages: Array<NuxtPage>,
  exclude: Array<string> = [],
  imgMeta: Array<Sitemap.ImageMeta> = [],
  disabledImg: Array<string> = [],
  imageFiles: Array<string> = [],
  imageDomain?: (url: string) => string | string,
  dynamicPaths?: () => Promise<Array<Sitemap.Meta>>
) {
  const staticPages = nuxtPages.filter((nuxtPage: NuxtPage) => !/\/(:|_)/i.test(nuxtPage.path))
  const dynamicPages = dynamicPaths ? await dynamicPaths() : [] as Array<Sitemap.Meta>

  const disabledImgRegExp = disabledImg.map(path => new RegExp(path))
  const enabledImages = imageFiles.filter(src => !disabledImgRegExp.find(regexp => regexp.test(src)))
    .sort((a, b) => a > b ? 1 : -1)

  const combined = ([...staticPages, ...dynamicPages] as Array<Sitemap.Meta>)
    .map((page) => {
      const images = page.images || []
      for (const i in imgMeta) {
        if (imgMeta[i]?.path !== page.path && !imgMeta[i].match?.test(page.path)) { continue }
        const imgRegExp = imgMeta[i].images.map(src => new RegExp(src))
        images.push(...enabledImages.filter(src => imgRegExp.find(regexp => regexp.test(src))))
      }
      const url = (domain + page.path.replace(/\/{1,}/g, '/'))
      return { url, images, lastMod, path: page.path }
    })

  const filtered = [...new Set(combined.map(({ url }) => url))]
    .map((uniqueUrl) => {
      const sameUrl = combined.filter(({ url }) => uniqueUrl === url)
      return sameUrl
        .reduce((acc, cur) => {
          acc.images = [...new Set([...acc.images, ...cur.images])]
          return acc
        }, { url: uniqueUrl, images: [], lastMod: sameUrl[0].lastMod, path: sameUrl[0].path })
    })
    .filter(({ path }) => !exclude.includes(path))

  const paths = filtered
    .map(({ images, ...data }) => {
      if (images && images.length > 0) {
        (data as any).images = images.sort().map(src => ({
          src: typeof imageDomain === 'function' ? imageDomain(src) : (imageDomain || domain) + src
        }))
      }
      return data
    })
    .sort((a, b) => a.url > b.url ? 1 : -1)
  const resolver = createResolver(__dirname)
  return pug.renderFile(resolver.resolve('./runtime/sitemap.pug'), { paths })
}

function writeFile (dir: string, data: string) {
  const resolver = createResolver(dir)
  writeFileSync(resolver.resolve('./sitemap.xml'), data, 'utf-8')
}

export {
  generateSitemap,
  writeFile
}
