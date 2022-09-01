import { defineNuxtConfig } from 'nuxt'
import MyModule from '../src/module'

export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'cuphead', content: 'uwu' }
      ]
    }
  },
  modules: [
    MyModule
  ],
  pageMeta: {
    domain: 'www.localhost.com',
    robots: {
      acl: [
        { userAgent: ['Googlebot'], disallow: ['/'], allow: ['/try-allow'] },
        { userAgent: ['Googlebot', 'AdsBot-Google'], disallow: ['/', '/admin'] },
        { userAgent: ['*'], disallow: ['/admin', '/stats'], crawlDelay: 2 }
      ],
      domain: [
        'www.test.com',
        'example.com'
      ]
    },
    sitemap: {
      dynamicPaths: async () => {
        await new Promise(resolve => setTimeout(() => { resolve(true) }, 5000))
        return [
          { path: '/items/1', images: ['/images/1.png'] },
          { path: '/items/2', images: ['/images/2.png'] },
          { path: '/menu', images: ['/images/menu-1.png'] }
        ]
      },
      exclude: [
        '/items/1'
      ],
      imageDomain: src => (/^\/assets\/?/.test(src) ? 'www.localhost.com' : 'cdn.localhost.com') + src,
      imageDirs: ['assets/images']
    }
  }
})
