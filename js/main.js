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
            var btn = $('<div>')
                .addClass('row')
                .attr('id', `comic-${i}`)
                .html(`<input type="button" value="Copy Tags" @click="copyTags(${i})">`)
            $(v).append(btn)
        })

        const app = new Vue({
            // el: `#${appId}`,
            el: '.wrap',
            data: {
                comicList: [],
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
                },
            },
            methods: {
                notImplemented: () => {
                    const msg = 'Not implemented!'
                    alert(msg)
                },
                copyNameAuthor: () => {
                    var list = [...app.comicList].reverse().map(v => `[${v.artist}] ${v.title}`)
                    // console.log(list)
                    var msg = list.join('\n')
                    console.log(msg)
                    download(msg, `Fakku-${Date.now()}.txt`, 'text/plain')
                },
                copyTags: (i) => {
                    var tags = app.comicList[i].tags
                        .filter(v => !app.tagExclude.includes(v))
                        .map(v => app.tagReplace[v] || v)
                    var content = tags.join(',')
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
                var list = this.comicList
                $.each($('.content-comic .content-meta'), (i, v) => {
                    var title = $('a[class=content-title]', v).text()
                    // console.log(title)
                    var artist = $('.row:nth-child(2) .row-right a', v).text()
                    // console.log(artist)
                    var tags = $('.tags a', v).toArray().map(v => v.text)
                    // console.log(tags)
                    list.push({ title, artist, tags })
                })
            },
        })

        // Show UI
        $(`#${appId}`).fadeToggle()
    })
})