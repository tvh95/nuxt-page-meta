import {
  resolve
} from 'path'
import {
  readdirSync,
  lstatSync
} from 'fs'

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

export {
  recursiveGetFiles
}
