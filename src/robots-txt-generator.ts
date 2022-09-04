import { writeFileSync } from 'fs'
import { createResolver } from '@nuxt/kit'

function generateRobotTxt (acl: Array<Robots.Meta> = [], domain: Array<string> = []) {
  const strArray = acl.map(({
    userAgent,
    allow,
    disallow,
    crawlDelay
  }) => {
    if (userAgent?.length < 1) { throw new Error('Missing user agent in 1 or more robots.txt config.') }
    let str = userAgent.map(s => `User-agent: ${s}`).join('\n')
    if (allow?.length > 0) { str += '\n' + allow.map(s => `Allow: ${s}`).join('\n') }
    if (disallow?.length > 0) { str += '\n' + disallow.map(s => `Disallow: ${s}`).join('\n') }
    if (crawlDelay) { str += `\nCrawl-delay: ${crawlDelay}` }
    return str
  })

  const sitemaps = domain.map(s => `Sitemap: ${s}/sitemap.xml`).join('\n')
  return [...strArray, sitemaps].join('\n\n')
}

function writeFile (dir: string, data: string) {
  const resolver = createResolver(dir)
  writeFileSync(resolver.resolve('./robots.txt'), data, 'utf-8')
}

export {
  generateRobotTxt,
  writeFile
}
