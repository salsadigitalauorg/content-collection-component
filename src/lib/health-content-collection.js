import ContentCollection from './content-collection.js'
const moment = require('dayjs')

export default class HealthContentCollection extends ContentCollection {

  getDisplayResultComponentName () {
    let returnName = null
    switch (this.getDisplayResultComponentType()) {
      case 'vh-search-result':
        returnName = 'vh-search-result'
        break
      case 'search-result':
        returnName = 'rpl-search-result'
        break
      default:
        returnName = super.getDisplayResultComponentName()
        break
    }
    return returnName
  }

  mapResult (item) {
    let mappedResult = null
    const _source = item._source
    const link = this.getLocalisedLink(_source.url)

    switch (this.getDisplayResultComponentType()) {
      case 'vh-search-result':
        mappedResult = this.vhSearchResultMapping(item)
        break
      case 'search-result':
        mappedResult = {
          title: _source.title?.[0],
          link: { linkText: link, linkUrl: link },
          date: _source.created?.[0],
          description: _source.field_landing_page_summary?.[0]
        }
        break
      default:
        mappedResult = super.mapResult(item)
        break
    }
    return mappedResult
  }

  vhSearchResultMapping (item) {
    const options = this.config.interface?.display?.resultComponent?.options
    return {
      icon: this.getVhSearchResultValue(options.icon, item),
      title: this.getVhSearchResultValue(options.title, item),
      date: this.getVhSearchResultValue(options.date, item),
      subTop: this.getVhSearchResultValue(options.subTop, item),
      summary: this.getVhSearchResultValue(options.summary, item),
      subBottom: this.getVhSearchResultValue(options.subBottom, item)
    }
  }

  getVhSearchResultValue (cfg, item) {
    let returnValue = null
    switch(cfg.type) {
      case 'icon':
        returnValue = cfg.symbol
        break
      case 'text':
        returnValue = item._source?.[cfg.field]?.[0]
        break
      case 'date':
        returnValue = moment(item._source?.[cfg.field]?.[0]).format(cfg.format)
        break
      case 'formatted':
        let x = cfg.format
        cfg.fields.forEach(fieldCfg => {
          const key = fieldCfg.field
          const val = this.getVhSearchResultValue(fieldCfg, item)
          x = x.replace(`{${key}}`, val || '')
        })
        returnValue = x
        break
    }
    return returnValue
  }
}
