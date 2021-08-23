const elasticSearch = require('./es.js');
const moment = require('dayjs');

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
    this.defaults = {
      ExposedFilterKeywordLabel: 'Search by keyword',
      ExposedFilterKeywordPlaceholder: 'Enter keywords',
      ExposedFilterSubmitLabel: 'Filter results',
      ExposedFilterClearFormLabel: 'Clear search filters',
      ExposedControlSortLabel: 'Sort',
      ExposedControlSortModel: 'sort',
      ExposedControlItemsPerPageLabel: 'Items per page',
      ExposedControlItemsPerPageModel: 'items_per_page',
      ExposedControlPaginationModel: 'page'
    }
  }

  // ---------------------------------------------------------------------------
  // Getters / Setters
  // ---------------------------------------------------------------------------
  getDefault (key) {
    return this.defaults[key]
  }

  cloneObject (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  getTitle () {
    return this.config.title
  }

  getDescription () {
    return this.config.description
  }

  getCTA () {
    return this.config.callToAction
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

  getInternalItemsToLoad () {
    return this.config.internal?.itemsToLoad
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
  getDSL (state) {
    // Uncomment below to temporarily test simple query.
    // return this.getSimpleDSL()

    if (this.config?.internal?.custom) {
      // Return Custom DSL if available.
      return this.config.internal.custom
    } else if (this.config?.internal) {
      // Generate and return the simplified DSL.
      return this.getSimpleDSL(state)
    } else {
      return null
    }
  }

  getSimpleDSL (state) {
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
    const dateRangeFilters = this.getSimpleDSLDateRange()
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

    if (dateRangeFilters.length > 0) {
      dateRangeFilters.forEach(item => {
        body.query.bool.filter.push(item)
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

  getSimpleDSLDateRange () {
    const filters = []
    if (this.config.internal?.dateFilter) {
      const df = this.config.internal.dateFilter
      var start = null
      var end = null
      var dates = null

      switch (df.criteria) {
        case 'range':
          start = df.dateRangeStart
          end = df.dateRangeEnd || df.dateRangeStart
          break

        case 'today':
          dates = this.getStartEndDates('day')
          start = dates.start
          end = dates.end
          break

        case 'this_week':
          dates = this.getStartEndDates('week')
          start = dates.start
          end = dates.end
          break

        case 'this_month':
          dates = this.getStartEndDates('month')
          start = dates.start
          end = dates.end
          break

        default:
          console.log('Criteria not supported')
          break
      }

      if (start && end) {
        filters.push({ 'range': { [df.startDateField]: { gte: start } } })
        filters.push({ 'range': { [df.endDateField]: { lte: end } } })
      }
    }
    return filters
  }

  getStartEndDates (type) {
    return {
      start: moment().startOf(type).format(),
      end: moment().endOf(type).format()
    }
  }

  // ---------------------------------------------------------------------------
  // Exposed Form Methods
  // ---------------------------------------------------------------------------
  getExposedFilterForm () {
    const groups = []
    const model = {}

    const keywordGroup = this.getExposedFilterKeywordGroup()
    if (keywordGroup) {
      model['q'] = ''
      groups.push(keywordGroup)
    }

    const advancedFilterGroup = this.getExposedFilterAdvancedFilterGroup()
    if (advancedFilterGroup) {
      model['filter_a'] = ''
      model['filter_b'] = ''
      groups.push(advancedFilterGroup)
    }

    const submissionGroup = this.getExposedFilterSubmissionGroup()
    if (submissionGroup) {
      groups.push(submissionGroup)
    }

    if (groups.length > 0) {
      return { model, schema: { groups }, formState: {} }
    }
    return null
  }

  getExposedFilterKeywordGroup () {
    const keyword = this.config?.interface?.keyword
    if (keyword) {
      return {
        fields: [{
          type: 'input',
          inputType: 'text',
          label: keyword?.label || this.getDefault('ExposedFilterKeywordLabel'),
          placeholder: keyword?.placeholder || this.getDefault('ExposedFilterKeywordPlaceholder'),
          model: 'q'
        }]
      }
    }
    return null
  }

  getExposedFilterAdvancedFilterGroup () {
    const filters = this.config?.interface?.filters?.fields
    if (filters?.length > 0) {
      const fields = []
      filters.forEach(schemaField => {
        const field = this.getExposedFilterField(schemaField)
        if (field) {
          fields.push(field)
        }
      })
      return {
        styleClasses: ['app-content-collection__form-wrap'],
        fields
      }
    }
    return null
  }

  getExposedFilterField (schemaField) {
    switch (schemaField.type) {
      case 'basic':
        const field = this.cloneObject(schemaField.options)
        field.styleClasses = schemaField.additionalClasses
        return field
        break
    }
    return null
  }

  getExposedFilterSubmissionGroup () {
    const fields = []
    const submit = this.config?.interface?.filters?.submit
    if (submit?.visibility === 'visible') {
      fields.push({
        type: 'rplsubmitloader',
        buttonText: submit?.label ?? this.getDefault('ExposedFilterSubmitLabel'),
        loading: false,
        autoUpdate: true,
        styleClasses: ['app-content-collection__form-inline']
      })
    }
    const clear = this.config?.interface?.filters?.clearForm
    if (clear?.visibility === 'visible') {
      fields.push({
        type: 'rplclearform',
        buttonText: clear?.label ?? this.getDefault('ExposedFilterClearFormLabel'),
        styleClasses: ['app-content-collection__form-inline']
      })
    }
    if (fields.length > 0) {
      return {
        styleClasses: ['app-content-collection__form-wrap'],
        fields: fields
      }
    }
    return null
  }

  getExposedFilterModelNames () {
    // TODO - This should come from the filters.
    return ['q', 'filter_a', 'filter_b']
  }

  getExposedControlsModelNames () {
    return this.getExposedControlFields().map(control => control.model)
  }

  getExposedControlFields () {
    const controls = [
      this.getExposedSortField(),
      this.getExposedItemsToLoadField()
    ]
    return controls.filter(item => item !== null)
  }

  getExposedControlsForm () {
    const fields = []
    const model = {}
    const controls = this.getExposedControlFields()
    controls.forEach(control => {
      model[control.model] = control.value
      fields.push(control.field)
    })

    if (fields.length > 0) {
      // TODO - Health Specific
      fields.push({
        type: 'rplsubmitloader',
        buttonText: 'Go',
        loading: false,
        autoUpdate: true,
        styleClasses: ['app-content-collection__form-inline']
      })
      return {
        model,
        schema: {
          groups: [{
            styleClasses: ['app-content-collection__form-wrap'],
            fields: fields
          }]
        },
        formState: {}
      }
    }
    return null
  }

  getExposedSortField () {
    const sort = this.config?.interface?.display?.options?.sort
    if (sort) {
      const values = sort.values.map(item => {
        return {
          id: item.name,
          name: item.name
        }
      })
      return {
        model: this.getDefault('ExposedControlSortModel'),
        value: values[0].id,
        field: {
          type: 'rplselect',
          model: this.getDefault('ExposedControlSortModel'),
          label: this.getDefault('ExposedControlSortLabel'),
          placeholder: 'Select a value',
          values: values,
          styleClasses: ['app-content-collection__form-col-2']
        }
      }
    } else {
      return null
    }
  }

  getExposedItemsToLoadField () {
    const itemsToLoad = this.config?.interface?.display?.options?.itemsToLoad
    if (itemsToLoad) {
      const values = itemsToLoad.values.map(item => {
        return {
          id: item.name.toString(),
          name: item.name
        }
      })
      return {
        model: this.getDefault('ExposedControlItemsPerPageModel'),
        value: values[0].id,
        field: {
          type: 'rplselect',
          model: this.getDefault('ExposedControlItemsPerPageModel'),
          label: this.getDefault('ExposedControlItemsPerPageLabel'),
          placeholder: 'Select a value',
          values: values,
          styleClasses: ['app-content-collection__form-col-2']
        }
      }
    } else {
      return null
    }
  }

  // ---------------------------------------------------------------------------
  // Search Query Methods
  // ---------------------------------------------------------------------------
  async getResults (state) {
    const esRequest = {
      from: this.getStartingItem(state),
      size: this.getItemsToLoad(state),
      filterPath: ['hits.hits', 'hits.total'],
      body: this.getDSL(state),
      _source: []
    }

    // TODO - Eventually this will connect into the tideSearch implementation.
    const results = await elasticSearch(esRequest)
    // TODO - Add some hardening around this to prevent errors.
    return results.hits.hits.map(this.mapResult.bind(this))
  }

  getItemsToLoad (state) {
    const modelName = this.getDefault('ExposedControlItemsPerPageModel')
    let loadCount = this.getInternalItemsToLoad() ?? 10
    if (state[modelName]) {
      loadCount = state.items_per_page
    }
    return loadCount
  }

  getStartingItem (state) {
    const modelName = this.getDefault('ExposedControlPaginationModel')
    let start = 0
    if (state[modelName]) {
      const total = this.getItemsToLoad(state)
      start = (state.page - 1) * total
    }
    return start
  }

  // ---------------------------------------------------------------------------
  // Result Mapping Method
  // ---------------------------------------------------------------------------
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
