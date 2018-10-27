/**
 * GLOBAL CONFIG
 */
const CONFIG = {
    comicTagExclude: [
        'illustration',
        'doujin',
        'non-h',
        'ecchi',
        'book',
    ],
    tagExclude: [
        'uncensored',
        'doujinshi',
        'subscription',
        'hentai',
        'creampie',
        'doujinshi',
    ],
    tagReplace: {
        'oppai': 'big breast',
        'blowjob': 'fellatio',
        'forced': 'rape',
        'schoolgirl outfit': 'Schoolgirl',
        'booty': 'Big ass',
        'toys': 'Sex Toys',
    },
    ignoreBook: true,
}

/**
 * CREATE VUE APP
 */
$(document).ready(() => {
    console.log('Fakku Helper ready!')

    const appId = 'fkh'
    const html = $('<div>')
        .attr('id', appId)
        .load(chrome.runtime.getURL('html/main.html'))
        .hide()
    // console.log(html)

    const sourcePanel = $('.wrap')
    // console.log(sourcePanel)
    sourcePanel.prepend(html).ready(() => {
        $.each($('.content-comic .content-meta'), (i, v) => {
            const btn = $('<div>')
                .addClass('row')
                .attr('id', `comic-${i}`)
                .html(`<input type="button" value="Copy Tags" @click="copyTags(${i})">`)
            $(v).append(btn)
        })

        const app = new Vue({
            // el: `#${appId}`,
            el: '.wrap',
            data: {
                comicList: [
                    // { title, artist, tags },
                ],
                comicTagExclude: CONFIG.comicTagExclude,
                tagExclude: CONFIG.tagExclude,
                tagReplace: CONFIG.tagReplace,
                ignoreBook: CONFIG.ignoreBook,
            },
            methods: {
                notImplemented: () => {
                    const msg = 'Not implemented!'
                    alert(msg)
                },
                copyNameAuthor: () => {
                    const list = [...app.comicList].reverse()
                        .filter(v => !app.comicTagExclude.some(u => v.tags.includes(u)))
                        .map(v => `[${v.artist}] ${v.title}`)
                    // console.log(list)
                    const msg = list.join('\n')
                    console.log(msg)
                    download(msg, `Fakku-${Date.now()}.txt`, 'text/plain')
                },
                copyTags: (i) => {
                    const tags = app.comicList[i].tags
                        .filter(v => !app.tagExclude.includes(v))
                        .map(v => app.tagReplace[v] || v)
                    const content = tags.join(',')
                    app.copyToClipboard(content)
                },
                copyToClipboard: (content) => {
                    const el = document.createElement('textarea')
                    el.value = content
                    document.body.appendChild(el)
                    el.select()
                    document.execCommand('copy')
                    document.body.removeChild(el)
                },
            },
            mounted: function () {
                const list = this.comicList
                $.each($('.content-comic .content-meta'), (_, v) => {
                    // console.log(v)
                    const metaList = $('.row .row-left', v)
                        .map(function () { return $(this).text().trim().toLowerCase() })
                        .toArray()
                    // console.log(metaList)
                    if (!!this.ignoreBook && metaList.includes('book')) {
                        return
                    }
                    const title = $('a[class=content-title]', v).text().trim()
                    // console.log(title)
                    const artist = $('.row:nth-child(2) .row-right a', v).text().trim()
                    // console.log(artist)
                    const tags = $('.tags a', v).toArray().map(v => v.text.trim())
                    // console.log(tags)
                    list.push({ title, artist, tags })
                })
            },
        })

        // Show UI
        $(`#${appId}`).fadeToggle()
    })
})