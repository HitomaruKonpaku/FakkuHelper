// eslint-disable-next-line no-undef
const path = require('path')
// eslint-disable-next-line no-undef
const fs = require('fs')
// eslint-disable-next-line no-undef
const dir = __dirname

console.log('Running...')
console.log('Dir    : ' + dir)

const fi = path.join(dir, 'fi.txt')
const fo = path.join(dir, 'fo.txt')

if (fs.existsSync(fi)) {
  console.log('Found  : ' + fi)
  const lines = fs.readFileSync(fi, { encoding: 'utf-8', flag: 'r' })
    .split('\n')
    .map(v => v.substring(v.indexOf(' ')).trim().toLowerCase().replace(/\W+/g, '-').replace(/^-|-$/g, ''))
    .map(v => `https://hentai.cafe/manga/read/${v}/en/0/1/`)
  const content = lines.join('\n')
  fs.writeFileSync(fo, content, { flag: 'w' })
  console.log('Done   : ' + fo)
} else {
  console.log('Created: ' + fi)
  fs.writeFileSync(fi, '', { flag: 'w' })
}

console.log('Completed')
