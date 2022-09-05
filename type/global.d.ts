export {}

declare global {
  export namespace Robots {
    interface Meta {
      userAgent: Array<string>
      disallow: Array<string>
      allow: Array<string>
      crawlDelay: number
    }

    interface Configuration {
      enable?: boolean
      acl?: Array<Meta>
      domain?: Array<string>
    }
  }

  export namespace Page {
    interface Configuration {
      enable?: boolean
      metaJson?: string
    }
  }

  export namespace Sitemap {
    interface MetaData {
      match: RegExp
      path: string
    }

    interface ImageMeta extends MetaData {
      images: Array<string>
    }

    interface ImageConfiguration {
      images: Array<ImageMeta>
      disabled: Array<string>
      unused: Array<string>
    }

    interface PageMetaConfiguration {
      keywords?: string
      description?: string
    }

    interface PageMeta extends MetaData {
      meta?: PageMetaConfig
    }

    interface Meta {
      path: string
      images: Array<string>
      lastMod: string
    }

    interface Configuration {
      enable?: boolean
      imgJson?: string
      imageDirs?: Array<string>
      dynamicPaths?: () => Promise<Array<Meta>>
      imageDomain?: (url: string) => string | string
      exclude?: Array<string>
    }
  }

  export namespace PageMeta {
    interface Configuration {
      domain: string
      robots?: Robots.Configuration
      page?: Page.Configuration
      sitemap?: Sitemap.Configuration
      env?: { [s: string]: string }
    }
  }
}
