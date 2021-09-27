import ContentCollection from './content-collection.js'
const moment = require('dayjs')

export default class HealthContentCollection extends ContentCollection {

  getDisplayResultComponentName () {
    let returnName = null
    switch (this.getDisplayResultComponentType()) {
      case 'vh-search-result':
        returnName = 'vh-search-result'
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
        mappedResult = this.vhSearchResultMapping(item, link)
        break
      default:
        mappedResult = super.mapResult(item)
        break
    }
    return mappedResult
  }

  vhSearchResultMapping (item, link) {
    const options = this.config.interface?.display?.resultComponent?.options
    return {
      icon: (options.icon) ? this.getVhSearchResultValue(options.icon, item) : null,
      title: (options.title) ? this.getVhSearchResultValue(options.title, item) : null,
      link: { linkText: link, linkUrl: link },
      subTop: (options.subTop) ? this.getVhSearchResultValue(options.subTop, item) : null,
      summary: (options.summary) ? this.getVhSearchResultValue(options.summary, item) : null,
      subBottom: (options.subBottom) ? this.getVhSearchResultValue(options.subBottom, item) : null
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

  getExposedFilterField (schemaField) {
    let returnFilterField = null
    switch (schemaField.type) {
      case 'a-z':
        const field = this.cloneObject(schemaField.options)
        field.type = field.type || 'rploptionbutton'
        field.label = field.label || 'Starting Letter'
        field.styleClasses = schemaField.additionalClasses || 'app-content-collection__form-col-full'
        returnFilterField = field
        break
      default:
        returnFilterField = super.getExposedFilterField(schemaField)
        break
    }
    return returnFilterField
  }

  getSimpleDSLExposedAdvancedFiltersField (field, esField, stateValue) {
    let returnESField = null
    switch (field.type) {
      case 'a-z':
        if (stateValue) {
          returnESField = { filter: { 'prefix': { [esField]: stateValue.toLowerCase() } } }
        }
        break
      default:
        returnESField = super.getSimpleDSLExposedAdvancedFiltersField(field, esField, stateValue)
        break
    }
    return returnESField
  }
}
