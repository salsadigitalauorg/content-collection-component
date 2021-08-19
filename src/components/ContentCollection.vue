<template>
  <div class="app-content-collection">
    <div v-if="debug" class="app-content-collection__debug">
      <strong>Schema</strong>
      <pre>{{ schema }}</pre>
      <strong>Query</strong>
      <pre>{{ debugSimpleDSL }}</pre>
    </div>

    <h2 v-if="title">{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div>Call to Action</div>
    <rpl-link :url="cta.url">{{ cta.text }}</rpl-link>
    <!-- Filters -->
    <!-- <rpl-form /> -->
    <rpl-select />
    <!-- Grid -->
    <div>Search Results</div>
    <rpl-search-results-layout
      :searchResults="results"
      :errorMsg="errorText"
      :noResultsMsg="noResultsText"
    >
      <template v-slot:count>{{ resultCount }}</template>
      <template v-slot:sort>Sort</template>
      <template v-slot:loading>{{ loadingText }}</template>
      <template v-slot:results="scoped">
        <!-- Results can be modified through slots. -->
        <slot name="results" :searchResults="scoped.searchResults">
          <rpl-col :colsBp="{ m: 6, l: 4, xxxl: 3 }" v-for="(result, i) in scoped.searchResults" :key="i + '-result'">
            {{ result }}
          </rpl-col>
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
import { RplSearchResultsLayout } from '@dpc-sdp/ripple-search'
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
    RplSearchResultsLayout
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
      results: []
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
.app-content-collection {
  background-color: pink;

  &__debug {
    background-color: #eee;
    font-size: 90%;
    padding: 5rem;
  }
}
</style>
