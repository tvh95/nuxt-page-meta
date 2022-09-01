import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  tryResolveModule
} from '@nuxt/kit'
import { NuxtPage } from '@nuxt/schema'
import {
  generateRobotTxt,
  writeFile as robotWriteFile
} from './robots-txt-generator'
import {
  generateSitemap,
  writeFile as sitemapWriteFile
} from './sitemap'
import { recursiveGetFiles } from './tools'

const meta = { name: 'nuxt-page-meta', configKey: 'pageMeta' }

const defaults: PageMeta.Configuration = {
  domain: '',
  robots: {
    enable: true,
    acl: [],
    domain: []
  },
  page: {
    enable: true,
    metaJson: 'static-data/page-meta.json'
  },
  sitemap: {
    enable: true,
    imgJson: 'static-data/sitemap-image.json'
  }
}

function setup (options: PageMeta.Configuration, nuxt) {
  if (!options.domain) { throw new Error('Missing domain configuration in pageMeta.') }

  const rootDirResolver = createResolver(nuxt.options.rootDir)
  const rootRegExp = new RegExp('^' + nuxt.options.rootDir)

  if (options.robots.enable) {
    nuxt.options.app?.head?.meta?.push({ name: 'robots', content: 'noindex' })
    nuxt.hook('close', () => {
      const domain = options.robots.domain
      if (!domain.find(s => s === options.domain)) { domain.push(options.domain) }
      const result = generateRobotTxt(options.robots.acl, domain)
      robotWriteFile(nuxt.options.generate.dir, result)
    })
  }

  if (options.page.enable) {
    const metaJson = options.page.metaJson ? tryResolveModule(rootDirResolver.resolve(options.page.metaJson)) : null
    global.metaData = metaJson ? require(metaJson) : {}
    const runtimeDir = createResolver(import.meta.url).resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)
    addPlugin(createResolver(runtimeDir).resolve('page-meta'))
  }

  if (options.sitemap.enable) {
    nuxt.hook('pages:extend', (_nuxtPages: Array<NuxtPage>) => { nuxtPages = _nuxtPages })

    let nuxtPages
    const imgJson = options.sitemap.imgJson ? tryResolveModule(rootDirResolver.resolve(options.sitemap.imgJson)) : null
    const imgData: Sitemap.ImageConfiguration = imgJson ? require(imgJson) : {}
    const imageDirs = (options.sitemap.imageDirs || ['assets/images', 'statics/images'])
      .reduce((acc, cur) => [
        ...acc,
        ...recursiveGetFiles(rootDirResolver.resolve(cur))
          .map(path => path.replace(rootRegExp, ''))
      ], [])
    nuxt.hook('close', async () => {
      const result = await generateSitemap(
        options.domain,
        nuxtPages,
        options.sitemap.exclude,
        imgData.images,
        imgData.disabled,
        imageDirs,
        options.sitemap.imageDomain,
        options.sitemap.dynamicPaths
      )
      sitemapWriteFile(nuxt.options.generate.dir, result)
    })
    // console.log('nuxt', nuxt)
    // const runtimeDir = createResolver(import.meta.url).resolve('./runtime')
    // nuxt.options.build.transpile.push(runtimeDir)
    // addPlugin(createResolver(runtimeDir).resolve('page-meta'))
  }
}

export default defineNuxtModule<Partial<PageMeta.Configuration>>({ meta, defaults, setup })
