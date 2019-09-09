(function (global, factory) {
  if (typeof global.FakkuHelper !== 'object') {
    throw new Error('FakkuHelper object not found!')
  }
  factory(global)
})(this, function (global) {

  console.log('FakkuHelper main loaded!')

  $(document).ready(onceReady)

  function onceReady() {
    console.log('FakkuHelper ready!')
    loadUI()
  }

  function getComicContainers() {
    const jq = $('.main .wrap .tab-content.active .content-comic')
    return jq
  }

  function loadUI() {
    // Navbar
    const navbarClass = 'fakku-helper-nav'
    const navbar = $('<div>')
      .addClass(navbarClass)
      .load(chrome.runtime.getURL('src/html/navbar.html'))
      .hide()
    $('.wrap').prepend(navbar)
    // Copy tags button
    const copyTagClass = 'fakku-helper-copy-tag'
    $('.content-meta', getComicContainers()).each((i, v) => {
      const btn = $('<div>')
        .addClass(['row', copyTagClass].join(' '))
        .attr('id', `comic-${i}`)
        .html(`<input type="button" value="Copy Tags" @click="copyTags(${i})">`)
      $(v).append(btn)
    })
    // Show navbar
    $(`.${navbarClass}`).fadeIn(loadApp)
  }

  function loadApp() {
    global.FakkuHelper.app = new Vue({
      el: '.wrap',
      data: {
        comicList: []
      },
      computed: {},
      mounted() {
        // Debug mode
        const debug = global.FakkuHelper.debug
        if (debug) console.log('MOUNTED')
        // Load comic list
        const comicList = this.comicList
        if (debug) console.groupCollapsed('COMICS')
        $(getComicContainers()).each((i, comicContent) => {
          //
          const comicObject = {}
          if (debug) console.group(i)
          if (debug) console.log(comicContent)
          //
          const comicContentMeta = $('.content-meta', comicContent)[0]
          if (debug) console.log(comicContentMeta)
          const title = $('a[class=content-title]', comicContentMeta).text().trim()
          if (debug) console.log(title)
          comicObject['title'] = title
          //
          if (debug) console.group('META')
          const metaList = $('.row:not([id])', comicContentMeta)
          metaList.each((i, meta) => {
            if (debug) console.log(meta)
            const metaKey = $('.row-left', meta).text().trim().toLowerCase()
            if (metaKey === 'tags') {
              const metaTags = $('.row-right.tags a', meta).toArray().map(v => v.text.trim())
              if (debug) console.log({ metaKey, metaTags })
              comicObject[metaKey] = metaTags
              return
            }
            const metaValue = $('.row-right', meta).text().trim()
            if (debug) console.log({ metaKey, metaValue })
            comicObject[metaKey] = metaValue
          })
          if (debug) console.groupEnd()
          //
          if (debug) console.groupEnd()
          comicList.push(comicObject)
        })
        if (debug) console.groupEnd()
      },
      methods: {
        getConfig() {
          return global.FakkuHelper.config
        },
        copyToClipboard(content) {
          const el = document.createElement('textarea')
          el.value = content
          document.body.appendChild(el)
          el.select()
          document.execCommand('copy')
          document.body.removeChild(el)
        },
        downloadContent(content, fileNamePrefix) {
          const date = new Date()
          const fileName = [
            'Fakku_',
            fileNamePrefix,
            '_',
            [date.getHours(), date.getMinutes(), date.getSeconds()].map(v => String(v).padStart(2, 0)).join(''),
            '.txt'
          ].join('')
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
          saveAs(blob, fileName)
        },
        generateNameAuthorTags({ includesTags }) {
          const config = this.getConfig()
          const list = [...this.comicList]
            .reverse()
            .filter(v => !config.comicTagExclude.some(u => v.tags.includes(u)))
            .filter(v => !config.ignoreBook || !v.book)
            .map(v => [
              `[${v.artist}] ${v.title}`,
              includesTags ? this.generateTags(v.tags) : ''
            ].join('\n').trim())
          const content = list.join(includesTags ? '\n\n' : '\n')
          // console.log(content)
          return content
        },
        copyNameAuthor() {
          const content = this.generateNameAuthorTags({ includesTags: false })
            .split('\n')
            .map((v, i, a) => `${String(i + 1).padStart(String(a.length).length, '0')}. ${v}`)
            .join('\n')
          console.log(content)
          this.downloadContent(content, 'Name')
        },
        copyNameAuthorTags() {
          const content = this.generateNameAuthorTags({ includesTags: true })
          console.log(content)
          this.downloadContent(content, 'Tag')
        },
        generateTags(tags) {
          const config = this.getConfig()
          const filterTags = tags
            .filter(v => !config.tagExclude.includes(v))
            .map(v => config.tagReplace[v] || v)
          console.log({ tags, filterTags })
          const content = filterTags.join(',')
          // console.log(content)
          return content
        },
        copyTags(index) {
          this.copyToClipboard(this.generateTags(this.comicList[index].tags))
        }
      }
    })
  }

})
