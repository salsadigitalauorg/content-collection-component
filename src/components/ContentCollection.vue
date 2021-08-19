<template>
  <div class="app-content-collection">
    <div v-if="debug" class="app-content-collection__debug">
      <strong>Schema</strong>
      <pre>{{ schema }}</pre>
      <strong>Query</strong>
      <pre>{{ debugSimpleDSL }}</pre>
    </div>
    <!-- Listing Content -->
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <rpl-link v-if="cta" :href="cta.url">{{ cta.text }}</rpl-link>
    <!-- Filters -->
    <rpl-form :formData="exposedFilterFormData" />
    <!-- Search Results -->
    <rpl-search-results-layout
      :searchResults="results"
      :errorMsg="errorText"
      :noResultsMsg="noResultsText"
    >
      <template v-slot:count>{{ resultCount }}</template>
      <template v-slot:sort>
        <rpl-form :formData="exposedControlFormData" />
      </template>
      <template v-slot:loading>{{ loadingText }}</template>
      <template v-slot:results="scoped">
        <!-- Results can be modified through slots. -->
        <slot name="results" :searchResults="scoped.searchResults">
          <template v-if="resultType === 'card'">
            <rpl-col :colsBp="{ m: 6, l: 4, xxxl: 3 }" v-for="(result, i) in scoped.searchResults" :key="i + '-result'">
              {{ result }}
            </rpl-col>
          </template>
          <template v-if="resultType === 'search-result'">
            <rpl-col v-for="(result, i) in scoped.searchResults" :key="i + '-result'">
              <rpl-search-result
                class="app-content-collection__search-result"
                :title="result.title"
                :link="{ linkText: result.url, linkUrl: result.url }"
                :date="result.created"
                :description="result.summary"
              />
            </rpl-col>
          </template>
        </slot>
      </template>
      <template v-slot:pagination>pagination</template>
    </rpl-search-results-layout>
    <hr/>
  </div>
</template>

<script>
import { RplLink } from '@dpc-sdp/ripple-link'
import { RplSelect, RplForm } from '@dpc-sdp/ripple-form'
import { RplCol } from '@dpc-sdp/ripple-grid'
import { RplSearchResultsLayout, RplSearchResult } from '@dpc-sdp/ripple-search'
import provideChildCols from '@dpc-sdp/ripple-global/mixins/ProvideChildCols'
import ContentCollection from '../lib/content-collection.js'

export default {
  name: 'AppContentCollection',
  mixins: [provideChildCols],
  components: {
    RplLink,
    RplForm,
    RplSelect,
    RplCol,
    RplSearchResultsLayout,
    RplSearchResult
  },
  props: {
    schema: Object,
    initialState: Object,
    sidebar: {
      type: Boolean,
      default: false
    },
    debug: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      state: {
        page: 1,
        itemsToLoad: 10
      },
      results: [],
      exposedFilterFormData: {
        model: {
          keywords: '',
          filter_a: '',
          filter_b: ''
        },
        schema: {
          groups: [
            {
              fields: [
                {
                  type: 'input',
                  inputType: 'text',
                  label: 'Keywords',
                  placeholder: 'Enter some text...',
                  model: 'keywords'
                }
              ]
            },
            {
              styleClasses: ['app-content-collection__form-wrap'],
              fields: [
                {
                  type: 'rplselect',
                  multiselect: true,
                  model: 'filter_a',
                  validator: ['required'],
                  label: 'Filter A',
                  placeholder: 'Select a value for the filter',
                  values: [{ id: 'A', name: 'Option A'}, { id: '2', name: 'Option B'}],
                  styleClasses: ['app-content-collection__form-col-2']
                },
                {
                  type: 'rplselect',
                  multiselect: true,
                  model: 'filter_b',
                  validator: ['required'],
                  label: 'Filter B',
                  placeholder: 'Select a value for the filter',
                  values: [{ id: 'A', name: 'Option X'}, { id: '2', name: 'Option Y'}],
                  styleClasses: ['app-content-collection__form-col-2']
                }
              ]
            },
            {
              styleClasses: ['app-content-collection__form-wrap'],
              fields: [
                {
                  type: 'rplsubmitloader',
                  buttonText: 'Filter results',
                  loading: false,
                  autoUpdate: true,
                  styleClasses: ['app-content-collection__form-inline']
                },
                {
                  type: 'rplclearform',
                  buttonText: 'Clear search filters',
                  styleClasses: ['app-content-collection__form-inline']
                }
              ]
            }
          ]
        },
        formState: {}
      },
      exposedControlFormData: {
        model: {
          itemsPerPage: '1',
          sort: '10'
        },
        schema: {
          groups: [{
            styleClasses: ['app-content-collection__form-wrap'],
            fields: [
              {
                type: 'rplselect',
                model: 'itemsPerPage',
                validator: ['required'],
                label: 'Items per page',
                placeholder: 'Select a value',
                values: [{ id: '1', name: 'Title ASC'}, { id: '2', name: 'Title DESC'}],
                styleClasses: ['app-content-collection__form-col-2']
              },
              {
                type: 'rplselect',
                model: 'sort',
                validator: ['required'],
                label: 'Sort',
                placeholder: 'Select a value',
                values: [{ id: '10', name: '10'}, { id: '20', name: '20'}],
                styleClasses: ['app-content-collection__form-col-2']
              },
              {
                type: 'rplsubmitloader',
                buttonText: 'Go',
                loading: false,
                autoUpdate: true,
                styleClasses: ['app-content-collection__form-inline']
              }
            ]
          }]
        },
        formState: {}
      }
    }
  },
  computed: {
    dataManager () {
      // TODO: This has changed slightly from the default implementation.
      return new ContentCollection(this.schema)
    },
    title () {
      return this.dataManager.getTitle()
    },
    description () {
      return this.dataManager.getDescription()
    },
    cta () {
      return this.dataManager.getCTA()
    },
    debugSimpleDSL () {
      return this.dataManager.getSimpleDSL()
    },
    resultCount () {
      return this.dataManager.getDisplayResultCountText()
    },
    loadingText () {
      return this.dataManager.getDisplayLoadingText()
    },
    noResultsText () {
      return this.dataManager.getDisplayNoResultsText()
    },
    errorText () {
      return this.dataManager.getDisplayErrorText()
    },
    resultType () {
      return this.dataManager.getDisplayResultComponentType()
    }
  },
  methods: {
    async getResults () {
      const response = await this.dataManager.getResults(this.state)
      console.table(response)
      this.results = response
    }
  },
  mounted () {
    this.getResults()
  }
}
</script>

<style lang="scss">
@import "~@dpc-sdp/ripple-global/scss/settings";
@import "~@dpc-sdp/ripple-global/scss/tools";

.app-content-collection {
  background-color: pink;

  &__debug {
    background-color: #eee;
    font-size: 90%;
    padding: 5rem;
  }

  &__search-result {
    width: 100%;
  }

  &__form-wrap {
    display: flex;
    align-items: flex-end;
  }

  &__form-col-2 {
    width: 100%;
    @include rpl-breakpoint('l') {
      width: 50%;
    }
  }

  &__form-inline {
    display: inline-block;
  }

  .rpl-search-results-layout__sort {
    width: 100%;
  }
  .rpl-search-results-layout__header {
    display: block;
  }
}
</style>
