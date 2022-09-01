# Nuxt Page Meta
This library is for
 - generating sitemap (with image sitemap)
 - generating robots.txt
 - easier managment for page specific meta desciption and meta keywords

TODO Features
 - open-graph data

## Init
init json config files  
`yarn page-meta:init`  
  
## nuxt.config
example: [repository](https://github.com/tvh95/nuxt-page-meta/blob/main/playground/nuxt.config.ts)
```
modules: [
  'nuxt-page-meta'
]
```
  
## Configurations
Config Key `pageMeta`  
```
{
  domain: <main domain of your website>,
  robots: {
    acl: [
      {
        userAgent: <Array of agent>,
        disallow: <Array of path to block>,
        allow: <Array of path to allow>,
        crawlDelay: 2
      }
    ],
    domain: <Array of domains including alternative domains of the website>
  },
  page: {
    enable: <default to true>,
    metaJson: <json file location, default to ~/static-data/page-meta.json>,
  }
  sitemap: {
    enable: <default to true>,
    imgJson: <json file location, default to ~/static-data/sitemap-image.json>,
    dynamicPaths: <Async function that return array of page meta(refer to page-meta.json)>,
    exclude: <Array of path to exclude from sitemap>,
    imageDomain: <function to conditionaly append image url>,
    imageDirs: <Array of image directory>
  }
}
```

## JSON Config files
### page-meta.json
- to configure page specific meta keywords nad description
```
[
  {
    "meta": {
      ["keywords"|"descriptions"]: <content in string>
    },
    "path": <exact path>,
    "match": <path regexp, in string>
  }
]
```
  
### sitemap-image.json
- to add image sitemap in sitemap.xml
```
  "disabled": <Array of image path to exclude from sitemap>,
  "images": [
    {
      "images": <array of images in this page>,
      "path": <exact path>,
      "match": <path regexp, in string>
    }
  ],
  "unused": <array of unused image crawled by "page-meta:init" command>
```
