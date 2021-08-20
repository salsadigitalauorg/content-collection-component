const elasticSearch = require('./es.js');

/**
 * ContentCollection
 * Provides an interface to query a content collection configuration.
 * Extend class to add additional functionality.
 */
module.exports = class ContentCollection {
  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------
  constructor (configuration) {
    this.config = configuration
  }

  // ---------------------------------------------------------------------------
  // Getters / Setters
  // ---------------------------------------------------------------------------
  getTitle () {
    return this.config.title
  }

  getDescription () {
    return this.config.description
  }

  getCTA () {
    return this.config.callToAction
  }

  getExposedFilterForm () {
    return {}
  }

  getSearchQuery () {
    return this.getDSL()
  }

  getDisplayType () {
    return this.config?.interface?.display?.type
  }

  getDisplayResultCountText () {
    return this.config?.interface?.display?.options?.resultsCountText
  }

  getDisplayLoadingText () {
    return this.config?.interface?.display?.options?.loadingText
  }

  getDisplayNoResultsText () {
    return this.config?.interface?.display?.options?.noResultsText
  }

  getDisplayErrorText () {
    return this.config?.interface?.display?.options?.errorText
  }

  getDisplayResultComponentType () {
    return this.config?.interface?.display?.resultComponent?.type
  }

  getDisplayResultComponentName () {
    switch (this.getDisplayResultComponentType()) {
      case 'search-result':
        return 'rpl-search-result'
        break
      case 'basic-card':
      default:
        return 'rpl-card-promo'
        break
    }
  }

  getDisplayResultComponentColumns () {
    switch (this.getDisplayResultComponentType()) {
      case 'search-result':
        return null
        break
      case 'basic-card':
      default:
        return { m: 6, l: 4, xxxl: 3 }
        break
    }
  }

  // ---------------------------------------------------------------------------
  // DSL Methods
  // ---------------------------------------------------------------------------
  getDSL () {
    // Uncomment below to temporarily test simple query.
    // return this.getSimpleDSL()

    if (this.config?.internal?.custom) {
      // Return Custom DSL if available.
      return this.config.internal.custom
    } else if (this.config?.internal) {
      // Generate and return the simplified DSL.
      return this.getSimpleDSL()
    } else {
      return null
    }
  }

  getSimpleDSL () {
    // Where should we set the site ID?
    const siteId = '4'
    // contentIds
    const contentIdFilters = this.getSimpleDSLContentIds()
    // contentTypes
    const contentTypeFilters = this.getSimpleDSLContentTypes()
    // contentFields
    const contentFieldFilters = this.getSimpleDSLContentFields()
    // includeCurrentPage
    // excludeIds
    // dateFilter
    // sort
    const sortFilters = this.getSimpleDSLSort()
    // itemsToLoad

    const body = {
      query: {
        bool: {
          must: [],
          filter: [],
          must_not: []
        }
      },
      sort: []
    }

    if (siteId) {
      body.query.bool.filter.push(
        { terms: { 'field_node_site': [siteId] } }
      )
    }

    if (contentIdFilters) {
      body.query.bool.filter.push(
        { terms: contentIdFilters }
      )
    }

    if (contentTypeFilters) {
      body.query.bool.filter.push(
         { terms: contentTypeFilters }
      )
    }

    if (contentFieldFilters.length > 0) {
      contentFieldFilters.forEach(item => {
        body.query.bool.filter.push(
          { 'terms': { [item.fieldName]: item.fieldConfig.values } } 
        )
      })
    }

    if (sortFilters.length > 0) {
      body.sort = sortFilters
    }

    return body
  }

  getSimpleDSLContentIds () {
    if (this.config.internal?.contentIds && !this.config.internal.contentIds.some(isNaN)) {
      return { "nid": this.config.internal.contentIds }
    }
    return null
  }

  getSimpleDSLContentTypes () {
    if (this.config.internal?.contentTypes) {
      return { "type": this.config.internal.contentTypes }
    }
    return null
  }

  getSimpleDSLContentFields () {
    const filters = []
    if (this.config.internal?.contentFields) {
      for (let [fieldName, fieldConfig] of Object.entries(this.config.internal.contentFields)) {
        filters.push(
          { 'fieldName': fieldName, 'fieldConfig': fieldConfig }
        )
      }
    }
    return filters
  }

  getSimpleDSLSort () {
    const filters = []
    if (this.config.internal?.sort) {
      this.config.internal.sort.forEach(item => {
        filters.push({ [item.field]: item.direction })
      })
    }
    return filters
  }

  // ---------------------------------------------------------------------------
  // Exposed Form Methods
  // ---------------------------------------------------------------------------
  getExposedFilterForm () {

  }

  getExposedSortForm () {
    const sort = this.config?.interface?.display?.options?.sort
    if (sort) {
      const options = sort.values.map(item => {
        return {
          label: item.name,
          value: item.value
        }
      })
      return {
        model: 'sort',
        label: 'Sort',
        value: options[0].value,
        options: options
      }
    } else {
      return null
    }
  }

  getExposedItemsToLoadForm () {
    const itemsToLoad = this.config?.interface?.display?.options?.itemsToLoad
    if (itemsToLoad) {
      const options = itemsToLoad.values.map(item => {
        return {
          label: item.name,
          value: item.value
        }
      })
      return {
        model: 'items_per_page',
        label: 'Items per page',
        value: options[0].value,
        options: options
      }
    } else {
      return null
    }
  }

  getControlFields () {
    const fields = []
    const sort = this.getExposedSortForm()
    if (sort) {
      fields.push(sort)
    }
    const itemsToLoad = this.getExposedItemsToLoadForm()
    if (itemsToLoad) {
      fields.push(itemsToLoad)
    }
    return fields
  }

  // ---------------------------------------------------------------------------
  // Search Query Methods
  // ---------------------------------------------------------------------------
  async getResults (state) {
    const internalDSL = this.getSearchQuery()
    // TODO - Eventually this will connect into the tideSearch implementation.
    const results = await elasticSearch(internalDSL)
    // TODO - Add some hardening around this to prevent errors.
    return results.hits.hits.map(this.mapResult.bind(this))
  }

  mapResult (item) {
    const _source = item._source

    switch (this.getDisplayResultComponentType()) {
      case 'search-result':
        return {
          title: _source.title?.[0],
          link: { linkText: _source.url?.[0], linkUrl: _source.url?.[0] },
          date: _source.created?.[0],
          description: _source.field_landing_page_summary?.[0]
        }
        break
      case 'card':
      default:
        return {
          title: _source.title?.[0],
          link: { text: _source.url?.[0], url: _source.url?.[0] },
          dateStart: _source.created?.[0],
          summary: _source.field_landing_page_summary?.[0]
        }
        break
    }
  }
}
