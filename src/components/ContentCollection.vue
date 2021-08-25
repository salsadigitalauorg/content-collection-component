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
    <rpl-form
      v-if="exposedFilterFormData"
      :formData="exposedFilterFormData"
      :submitHandler="exposedFilterFormSubmit"
    />
    <!-- Search Results -->
    <rpl-search-results-layout
      :searchResults="results"
      :errorMsg="errorText"
      :noResultsMsg="noResultsText"
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
            v-if="paginationData"
            v-bind="paginationData"
            @change="paginationChange"
          />
        </rpl-col>
      </template>
    </rpl-search-results-layout>
    <hr/>
  </div>
</template>

<script>
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
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const dataManager = new ContentCollection(this.schema)
    return {
      dataManager,
      defaultState: dataManager.getDefaultState(),
      state: dataManager.getDefaultState(),
      results: [],
      resultTotal: null,
      resultCount: null,
      exposedFilterFormData: dataManager.getExposedFilterForm(),
      exposedControlsFormData: dataManager.getExposedControlsForm(),
      exposedControlModels: dataManager.getExposedControlsModelNames(),
      exposedFilterModels: dataManager.getExposedFilterModelNames(),
      paginationData: { totalSteps: 0, initialStep: 1, stepsAround: 2 }
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
    debugSimpleDSL () {
      return this.dataManager.getSimpleDSL()
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
    }
  },
  methods: {
    async getResults () {
      const response = await this.dataManager.getResults(this.state)
      console.log(response)
      this.results = response.hits
      this.resultCount = this.dataManager.getProcessedResultsCount(this.state, response.total)
      this.paginationData.totalSteps = this.dataManager.getPaginationTotalSteps(this.state, response.total)
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
  background-color: grey;

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
