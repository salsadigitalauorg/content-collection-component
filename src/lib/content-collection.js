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
      ExposedControlPaginationModel: 'page',
      ExposedFilterKeywordModel: 'q',
      ExposedFilterKeywordType: 'phrase_prefix',
      ExposedFilterKeywordDefaultFields: ['title', 'body', 'summary_processed', 'field_landing_page_summary', 'field_paragraph_summary', 'field_page_intro_text', 'field_paragraph_body']
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

  getStateValue (state, defaultKey) {
    return state[this.getDefault(defaultKey)]
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

  getDisplayPaginationComponentColumns () {
    return { m: 6, l: 4, xxxl: 3 }
  }

  // ---------------------------------------------------------------------------
  // DSL Methods
  // ---------------------------------------------------------------------------
  getDSL (state) {
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
    const sortFilters = this.getSimpleDSLSort(state)
    // keyword
    const exposedKeyword = this.getSimpleDSLExposedKeyword(state)
    // advanced filters
    const advancedFilters = this.getSimpleDSLExposedAdvancedFilters(state)

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

    if (exposedKeyword) {
      body.query.bool.must.push(exposedKeyword)
    }

    if (advancedFilters) {
      body.query.bool.filter.push(...advancedFilters.filters)
      if (advancedFilters.aggs) {
        body.aggs = advancedFilters.aggs
      }
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

  getSimpleDSLExposedKeyword (state) {
    const keyword = this.config?.interface?.keyword
    if (keyword.type === 'basic') {
      const stateValue = this.getStateValue(state, 'ExposedFilterKeywordModel')
      if (stateValue) {
        return {
          multi_match: {
            query: stateValue,
            type: this.getDefault('ExposedFilterKeywordType'),
            fields: keyword.fields ?? this.getDefault('ExposedFilterKeywordDefaultFields')
          }
        }
      }
    }
    return null
  }

  getSimpleDSLExposedAdvancedFilters (state) {
    const filterFields = this.config?.interface?.filters?.fields
    if (filterFields) {
      const filters = []
      let aggs = null
      filterFields.forEach(group => {
        const model = group.options.model
        const value = state[model]
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filters.push({ 'terms': { [model]: value } })
          }
        } else if (value) {
          filters.push({ 'terms': { [model]: [value] } })
        }
        // Check for aggs
        if (group['elasticsearch-aggregation']) {
          if (!aggs) {
            aggs = {}
          }
          aggs[model] = {
            terms: { field: model, order: { _key: 'asc' }, size: 30 }
          }
        }
      })
      return { filters, aggs }
    }
    return null
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

  getSimpleDSLSort (state) {
    let filters = []
    let sortValue = null
    const stateSortId = this.getStateValue(state, 'ExposedControlSortModel')
    if (stateSortId) {
      sortValue = this.getSortValueFromId(stateSortId)
    } else {
      sortValue = this.config.internal?.sort
    }
    if (sortValue) {
      filters = sortValue.map(item => ({ [item.field]: item.direction }))
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
    const filterGroups = this.getExposedFilterGroups()

    filterGroups.forEach(group => {
      if (group.models) {
        group.models.forEach((item, idx) => {
          model[item] = group.values[idx]
        })
      }
      groups.push(group.group)
    })

    if (groups.length > 0) {
      return { model, schema: { groups }, formState: {} }
    }
    return null
  }

  getExposedFilterGroups() {
    const groups = [
      this.getExposedFilterKeywordGroup(),
      this.getExposedFilterAdvancedFilterGroup(),
      this.getExposedFilterSubmissionGroup()
    ]
    return groups.filter(item => item !== null)
  }

  getExposedFilterKeywordGroup () {
    const keyword = this.config?.interface?.keyword
    if (keyword) {
      const model = this.getDefault('ExposedFilterKeywordModel')
      return {
        models: [model],
        values: [''],
        group: {
          fields: [{
            type: 'input',
            inputType: 'text',
            label: keyword?.label || this.getDefault('ExposedFilterKeywordLabel'),
            placeholder: keyword?.placeholder || this.getDefault('ExposedFilterKeywordPlaceholder'),
            model: model
          }]
        }
      }
    }
    return null
  }

  getExposedFilterAdvancedFilterGroup () {
    const filters = this.config?.interface?.filters?.fields
    if (filters?.length > 0) {
      const models = []
      const values = []
      const fields = []
      filters.forEach(schemaField => {
        const field = this.getExposedFilterField(schemaField)
        models.push(field.model)
        values.push(this.getExposedFilterFieldDefaultValue(schemaField))
        if (field) {
          fields.push(field)
        }
      })
      return {
        models: models,
        values: values,
        group: {
          styleClasses: ['app-content-collection__form-wrap'],
          fields
        }
      }
    }
    return null
  }

  getExposedFilterFieldDefaultValue (schemaField) {
    if (schemaField.type === 'basic') {
      if (schemaField.options.type === 'rplselect') {
        if (schemaField.options.multiselect) {
          return []
        }
      }
    }
    return ''
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
        group: {
          styleClasses: ['app-content-collection__form-wrap'],
          fields: fields
        }
      }
    }
    return null
  }

  getExposedFilterModelNames () {
    let modelNames = []
    this.getExposedFilterGroups().forEach(group => {
      if (group.models) {
        modelNames.push(...group.models)
      }
    })
    return modelNames
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

  getSortValueFromId (option) {
    const sortValues = this.getExposedSortValues()
    if (sortValues) {
      const idx = sortValues.findIndex(val => val.id === option)
      if (idx >= 0) {
        return sortValues[idx].value
      }
    }
    return null
  }

  getExposedSortValues () {
    const sort = this.config?.interface?.display?.options?.sort
    if (sort) {
      return sort.values.map(item => {
        return {
          id: item.name, // TODO - Consider using a URI friendly name?
          name: item.name,
          value: item.value
        }
      })
    }
    return null
  }

  getExposedSortField () {
    const sortValues = this.getExposedSortValues()
    if (sortValues) {
      return {
        model: this.getDefault('ExposedControlSortModel'),
        value: sortValues[0].id,
        field: {
          type: 'rplselect',
          model: this.getDefault('ExposedControlSortModel'),
          label: this.getDefault('ExposedControlSortLabel'),
          placeholder: 'Select a value',
          values: sortValues.map(({ id, name }) => ({ id, name })),
          styleClasses: ['app-content-collection__form-col-2']
        }
      }
    }
    return null
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
      filterPath: ['hits.hits', 'hits.total', 'aggregations'],
      body: this.getDSL(state),
      _source: []
    }

    // TODO - Eventually this will connect into the tideSearch implementation.
    const results = await elasticSearch(esRequest)
    // TODO - Add some hardening around this to prevent errors.
    return {
      hits: results.hits.hits.map(this.mapResult.bind(this)),
      total: results.hits.total,
      aggregations: results.aggregations
    }
  }

  getDefaultState () {
    // TODO - Populate based on exposed filter defaults.
    return {
      page: 1,
      items_per_page: '5',
      sort: 'Relevance',
      q: '',
      type: '',
      filter_b: []
    }
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

  getResultCountRange (state, count) {
    const initialStep = state.page
    const itemsPerPage = state.items_per_page
    if (count && count > 0) {
      const from = initialStep < 2 ? 1 : (itemsPerPage * (initialStep - 1)) + 1
      const byPage = itemsPerPage * initialStep
      const total = (byPage > count) ? count : byPage
      return `${from}-${total}`
    }
    return false
  }

  getProcessedResultsCount (state, count) {
    let text = this.getDisplayResultCountText()
    const range = this.getResultCountRange(state, count)
    text = text.replace('{range}', range)
    text = text.replace('{count}', count)
    return text
  }

  getPaginationTotalSteps (state, count) {
    return Math.ceil(Number(count) / this.getItemsToLoad(state))
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
