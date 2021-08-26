<template>
  <div class="app-content-collection">
    <!-- Heading -->
    <div class="app-content-collection__header">
      <div class="app-content-collection__header-left">
        <h2 v-if="title" class="app-content-collection__heading">{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="app-content-collection__header-right">
        <rpl-link v-if="cta" :href="cta.url">{{ cta.text }}</rpl-link>
      </div>
    </div>
    <!-- Filters -->
    <rpl-form
      v-if="exposedFilterFormData"
      :formData="exposedFilterFormData"
      :submitHandler="exposedFilterFormSubmit"
    />
    <hr v-if="exposedFilterFormData" />
    <!-- Search Results -->
    <rpl-search-results-layout
      :searchResults="results"
      :errorMsg="errorText"
      :noResultsMsg="noResultsText"
      :loading="resultsLoading"
    >
      <template v-slot:count v-if="resultCount">{{ resultCount }}</template>
      <template v-slot:sort>
        <rpl-form
          v-if="exposedControlsFormData"
          :formData="exposedControlsFormData"
          :submitHandler="exposedControlsFormSubmit"
          :listenForClearForm="false"
        />
      </template>
      <template v-slot:loading>{{ loadingText }}</template>
      <template v-slot:results="scoped">
        <!-- Results can be modified through slots. -->
        <slot name="results" :searchResults="scoped.searchResults">
          <rpl-col
            v-for="(result, i) in scoped.searchResults"
            :key="`${i}-result`"
            :colsBp="resultColumns"
          >
            <component
              class="app-content-collection__search-result"
              :is="resultComponentName"
              v-bind="result"
            />
          </rpl-col>
        </slot>
      </template>
      <template v-slot:pagination>
        <rpl-col cols="full" :colsBp="paginationColumns">
          <rpl-pagination
            v-if="showPagination"
            v-bind="paginationData"
            @change="paginationChange"
          />
        </rpl-col>
      </template>
    </rpl-search-results-layout>
  </div>
</template>

<script>
import Vue from 'vue'
import { RplLink } from '@dpc-sdp/ripple-link'
import { RplForm } from '@dpc-sdp/ripple-form'
import { RplCol } from '@dpc-sdp/ripple-grid'
import provideChildCols from '@dpc-sdp/ripple-global/mixins/ProvideChildCols'
import ContentCollection from '../lib/content-collection.js'
import RplPagination from '@dpc-sdp/ripple-pagination'
import { RplSearchResultsLayout, RplSearchResult } from '@dpc-sdp/ripple-search'
import { RplCardPromo } from '@dpc-sdp/ripple-card'
// TODO - We need to figure out how custom result components can be loaded.

export default {
  name: 'AppContentCollection',
  mixins: [provideChildCols],
  components: {
    RplLink,
    RplForm,
    RplCol,
    RplSearchResultsLayout,
    RplSearchResult,
    RplCardPromo,
    RplPagination
  },
  props: {
    schema: Object,
    initialState: Object,
    sidebar: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const searchEndpoint = this.searchEndpoint.bind(this)
    const environment = {
      siteId: '4',
      primarySiteId: '4',
      domains: { '4': '' }
    }
    const dataManager = new ContentCollection(this.schema, searchEndpoint, environment)
    return {
      dataManager,
      defaultState: dataManager.getDefaultState(),
      state: dataManager.getDefaultState(),
      results: [],
      resultTotal: null,
      resultCount: null,
      resultsLoading: false,
      exposedFilterFormData: dataManager.getExposedFilterForm(),
      exposedControlsFormData: dataManager.getExposedControlsForm(),
      exposedControlModels: dataManager.getExposedControlsModelNames(),
      exposedFilterModels: dataManager.getExposedFilterModelNames(),
      paginationData: dataManager.getDisplayPagination()
    }
  },
  computed: {
    title () {
      return this.dataManager.getTitle()
    },
    description () {
      return this.dataManager.getDescription()
    },
    cta () {
      return this.dataManager.getCTA()
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
    resultComponentName () {
      return this.dataManager.getDisplayResultComponentName()
    },
    resultColumns () {
      return this.dataManager.getDisplayResultComponentColumns()
    },
    paginationColumns () {
      return this.dataManager.getDisplayPaginationComponentColumns()
    },
    showPagination () {
      return this.paginationData && this.paginationData.totalSteps > 1
    }
  },
  methods: {
    searchEndpoint (dsl) {
      return this.$tideSearchApi.searchByPost(dsl)
    },
    async getResults () {
      this.resultsLoading = true
      const response = await this.dataManager.getResults(this.state)
      if (this.exposedFilterFormData && response.aggregations) {
        // Aggregations
        // TODO - Some of this needs to be in ContentCollection, some here.
        Object.keys(response.aggregations).forEach(model => {
          this.exposedFilterFormData.schema.groups.forEach(group => {
            group.fields.forEach(field => {
              if (field.model === model) {
                const buckets = response.aggregations[model].buckets
                if (buckets.length > 0) {
                  field.values = buckets.map(({ key, doc_count: count }) => ({ id: key, name: `${key} (${count})` }))
                  Vue.set(field, 'disabled', false)
                } else {
                  this.state[model] = this.defaultState[model]
                  field.values = this.state[model]
                  Vue.set(field, 'disabled', true)
                }
              }
            })
          })
        })
      }
      this.results = response.hits
      this.resultCount = this.dataManager.getProcessedResultsCount(this.state, response.total)
      if (this.paginationData) {
        this.paginationData.totalSteps = this.dataManager.getPaginationTotalSteps(this.state, response.total)
      }
      this.resultsLoading = false
    },
    getNewValue (value) {
      return Array.isArray(value) ? [...value] : value
    },
    syncTo (from, to, allowed) {
      Object.keys(from).forEach(key => {
        const canSync = allowed ? (allowed.indexOf(key) >= 0) : true
        if (canSync) {
          to[key] = this.getNewValue(from[key])
        }
      })
    },
    paginationChange (value) {
      this.syncTo({ page: value }, this.state)
      this.updateQuery()
    },
    exposedFilterFormSubmit () {
      this.syncTo(this.exposedFilterFormData.model, this.state)
      this.state.page = 1
      this.updateQuery()
    },
    exposedControlsFormSubmit () {
      this.syncTo(this.exposedControlsFormData.model, this.state)
      this.state.page = 1
      this.updateQuery()
    },
    updateQuery () {
      const query = {}
      // TODO - Take into account the default state.
      this.syncTo(this.state, query)
      this.$router.replace({ query })
    },
    syncQueryState (query) {
      this.syncTo(query, this.state)
      if (this.exposedFilterFormData) {
        this.syncTo(this.state, this.exposedFilterFormData.model, this.exposedFilterModels)
      }
      if (this.exposedControlsFormData) {
        this.syncTo(this.state, this.exposedControlsFormData.model, this.exposedControlModels)
      }
      // TODO - The pagination implementation could be cleaner.
      if (this.paginationData) {
        this.paginationData.initialStep = parseInt(this.state.page)
      }
    }
  },
  watch: {
    $route (to, from) {
      this.syncQueryState(to.query)
      this.getResults()
    }
  },
  mounted () {
    this.syncQueryState(this.$route.query)
    this.getResults()
  }
}
</script>

<style lang="scss">
@import "~@dpc-sdp/ripple-global/scss/settings";
@import "~@dpc-sdp/ripple-global/scss/tools";

.app-content-collection {
  &__header {
    @include rpl-breakpoint('m') {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  }

  &__heading {
    @include rpl_typography('heading_l')
    margin: 0;
    margin-bottom: $rpl-space * 5;
  }

  &__search-result {
    width: 100%;
    padding-bottom: 0 !important;
  }

  &__form-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  &__form-col-full {
    width: 100%;
  }

  &__form-col-2 {
    width: 100%;
    @include rpl-breakpoint('m') {
      width: 50%;
    }
  }

  &__form-col-3 {
    width: 100%;
    @include rpl-breakpoint('m') {
      width: 50%;
    }
    @include rpl-breakpoint('l') {
      width: 33.33%;
    }
  }

  &__form-col-4 {
    width: 100%;
    @include rpl-breakpoint('m') {
      width: 50%;
    }
    @include rpl-breakpoint('l') {
      width: 25%;
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
