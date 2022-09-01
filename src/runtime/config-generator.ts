#! /usr/bin/env node
import {
  resolve,
  dirname
} from 'path'
import {
  readFileSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  existsSync,
  lstatSync
} from 'fs'
import consola from 'consola'
import { loadConfig } from 'c12'
import lodash from 'lodash'

const relativeDir = process.argv[2] || ''
const rootDir = resolve(process.cwd(), relativeDir)

async function nuxtConfig () {
  const { config } = await loadConfig({
    name: 'nuxt',
    configFile: resolve(rootDir, 'nuxt.config'),
    rcFile: resolve(rootDir, '.nuxtrc'),
    dotenv: true,
    globalRc: true
  })
  if (!config) { throw new Error('Missing nuxt config.') }

  return config.pageMeta || {}
}

function recursiveGetFiles (dir: string) {
  return readdirSync(dir)
    .reduce((acc, path) => {
      const newPath = resolve(dir, path)
      if (lstatSync(newPath).isDirectory()) {
        acc.push(...recursiveGetFiles(newPath))
      } else {
        acc.push(newPath)
      }
      return acc
    }, [])
}

;(async () => {
  consola.log('Reading config from')
  try {
    const config = await nuxtConfig()
    const metaJson = resolve(rootDir, config.page?.metaJson || 'static-data/page-meta.json')
    const imgJson = resolve(rootDir, config.sitemap?.imgJson || 'static-data/sitemap-image.json')
    const imageDirs = (config.sitemap?.imageDirs || ['assets/images']).map(path => resolve(rootDir, path))

    const pagesDir = resolve(rootDir, './pages')
    const pagesDirRegExp = new RegExp('^' + pagesDir.replace(/\//, '\\/'))
    const pagesList = recursiveGetFiles(pagesDir)
      .map((path) => {
        const cleanPath = path.replace(pagesDirRegExp, '').replace(/\.vue$/, '')
        if (/\/(_|:)/.test(cleanPath)) {
          return { match: '^' + cleanPath.replace(/\/_[^/]*/, '\\/[^/]*').replace(/\//, '\\/') + '\\/?$' }
        }
        return { path: cleanPath }
      })

    const metaJsonNewData = pagesList.map(data => ({ ...data, meta: {} }))
    if (existsSync(metaJson)) {
      const metaJsonOldData = JSON.parse(readFileSync(metaJson, 'utf-8'))
      lodash.merge(metaJsonNewData, metaJsonOldData)
    }
    mkdirSync(dirname(metaJson), { recursive: true })
    writeFileSync(metaJson, JSON.stringify(metaJsonNewData, undefined, 2))

    const rootDirRegExp = new RegExp('^' + rootDir.replace(/\//, '\\/'))
    const imageList = imageDirs
      .filter(imageDir => existsSync(imageDir))
      .reduce((acc, imageDir) => {
        return [...acc, ...recursiveGetFiles(imageDir).map(path => path.replace(rootDirRegExp, ''))]
      }, [])
    const imgJsonNewData = {
      disabled: [],
      images: pagesList.map(data => ({ ...data, images: [] })),
      unused: imageList
    }
    if (existsSync(imgJson)) {
      const imgJsonOldData = JSON.parse(readFileSync(imgJson, 'utf-8'))
      lodash.merge(imgJsonNewData, imgJsonOldData)
      const usedImage = imgJsonNewData.images.reduce((acc, { images }) => [...acc, ...images], [])
      imgJsonNewData.unused = imgJsonNewData.unused.filter(imagePath => !usedImage.includes(imagePath) && !imgJsonNewData.disabled.includes(imagePath))
    }
    mkdirSync(dirname(imgJson), { recursive: true })
    writeFileSync(imgJson, JSON.stringify(imgJsonNewData, undefined, 2))
  } catch (error) {
    consola.error(error.message)
  }
})()
