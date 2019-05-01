(function (global, factory) {
  if (typeof global.FakkuHelper !== 'object') {
    throw new Error('FakkuHelper object not found!')
  }
  factory(global)
})(this, function (global) {

  console.log('FakkuHelper config loaded!')

  global.FakkuHelper.config = {
    comicTagExclude: [
      'illustration',
      'doujin',
      'non-h',
      'ecchi',
      'book'
    ],
    tagExclude: [
      'uncensored',
      'doujinshi',
      'subscription',
      'hentai',
      'creampie',
      'doujinshi'
    ],
    tagReplace: {
      'oppai': 'big breast',
      'blowjob': 'fellatio',
      'forced': 'rape',
      'schoolgirl outfit': 'Schoolgirl',
      'booty': 'Big ass',
      'toys': 'Sex Toys'
    },
    ignoreBook: true
  }

})
