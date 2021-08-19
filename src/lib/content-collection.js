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

  // ---------------------------------------------------------------------------
  // DSL Methods
  // ---------------------------------------------------------------------------
  getDSL () {
    // Uncomment below to temporarily test simple query.
    return this.getSimpleDSL()

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
  // Search Query Methods
  // ---------------------------------------------------------------------------
  async getResults (state) {
    const internalDSL = this.getSearchQuery()
    // TODO - Eventually this will connect into the tideSearch implementation.
    const results = await elasticSearch(internalDSL)
    return results.hits.hits.map(this.mapResult)
  }

  mapResult (item) {
    const _source = item._source
    return {
      nid: _source.nid?.[0],
      title: _source.title?.[0],
      type: _source.type?.[0],
      created: _source.created?.[0],
      field_topic: _source.field_topic?.[0],
      field_tags: _source.field_tags?.[0],
      url: _source.url?.[0],
      summary: _source.field_landing_page_summary?.[0]
    }
  }
}
