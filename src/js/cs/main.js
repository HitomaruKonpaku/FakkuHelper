(function () {
  'use strict'

  $(document).ready(() => {
    console.log('Fakku Helper ready!')
    runOnReady()
  })

  function runOnReady() {
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
    window.FakkuHelper.app = new Vue({
      el: '.wrap',
      data: {
        comicList: [
          // { title, artist, tags, isBook },
        ]
      },
      computed: {},
      mounted() {
        // Load comic list
        const list = this.comicList
        const selector = '.front-page > div > div:nth-child(2) > .content-comic .content-meta'
        $.each($(selector), (i, v) => {
          // console.log(`----------${i}----------`)
          // console.log(v)
          const title = $('a[class=content-title]', v).text().trim()
          // console.log(title)
          const artist = $('.row:nth-child(2) .row-right a', v).text().trim()
          // console.log(artist)
          const tags = $('.tags a', v).toArray().map(v => v.text.trim())
          // console.log(tags)
          const metaList = $('.row .row-left', v).toArray().map(v => v.textContent.trim().toLowerCase())
          // console.log(metaList)
          const isBook = metaList.includes('book')
          list.push({ title, artist, tags, isBook })
        })
      },
      methods: {
        getConfig() {
          return window.FakkuHelper.config
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
          download(content, `Fakku-${Date.now()}.txt`, 'text/plain')
        },
        generateNameAuthorTags({ includesTags }) {
          const config = this.getConfig()
          const list = [...this.comicList]
            .reverse()
            .filter(v => !config.comicTagExclude.some(u => v.tags.includes(u)))
            .filter(v => !config.ignoreBook || !v.isBook)
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
          this.downloadContent(this.generateNameAuthorTags({ includesTags: false }))
        },
        copyNameAuthorTags() {
          this.downloadContent(this.generateNameAuthorTags({ includesTags: true }))
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

})()
