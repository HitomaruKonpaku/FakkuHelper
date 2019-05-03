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

  function loadUI() {
    // Navbar
    const navbarClass = 'fakku-helper-nav'
    const navbar = $('<div>')
      .addClass(navbarClass)
      .load(chrome.runtime.getURL('src/html/navbar.html'))
      .hide()
    $('.wrap').prepend(navbar).ready(() => {
      const copyTagClass = 'fakku-helper-copy-tag'
      // Comic button
      $.each($('.wrap .content-comic .content-meta'), (i, v) => {
        const btn = $('<div>')
          .addClass(['row', copyTagClass].join(' '))
          .attr('id', `comic-${i}`)
          .html(`<input type="button" value="Copy Tags" @click="copyTags(${i})">`)
        $(v).append(btn)
      })
    })
    // Show navbar
    $(`.${navbarClass}`).fadeToggle(loadApp)
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
        // Load comic list
        const comicList = this.comicList
        const comicContainer = '.tab-content.active .content-row.content-comic'
        $(comicContainer).each((i, comicContent) => {
          const comicObject = {}
          if (debug) console.log(`----------${i}----------`)
          if (debug) console.log(comicContent)
          const comicContentMeta = $('.content-meta', comicContent)[0]
          if (debug) console.log(comicContentMeta)
          const title = $('a[class=content-title]', comicContentMeta).text().trim()
          if (debug) console.log(title)
          comicObject['title'] = title
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
          comicList.push(comicObject)
        })
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
        downloadContent(content) {
          const date = new Date()
          const fileName = [
            'Fakku_',
            ...[
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
              date.getSeconds()
            ].map(v => String(v).padStart(2, 0).slice(-2)),
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
              '[' + v.artist + ']',
              v.title,
              !includesTags ? '' : '| ' + this.generateTags(v.tags)
            ].join(' ').trim())
          const content = list.join('\n')
          console.log(content)
          return content
        },
        copyNameAuthor() {
          const content = this.generateNameAuthorTags({ includesTags: false })
          this.downloadContent(content)
        },
        copyNameAuthorTags() {
          const content = this.generateNameAuthorTags({ includesTags: true })
          this.downloadContent(content)
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
