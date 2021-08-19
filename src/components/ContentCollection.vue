<template>
  <div class="app-content-collection">
    <pre>{{ schema }}</pre>
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div>Call to Action</div>
    <rpl-link :url="cta.url">{{ cta.text }}</rpl-link>
    <!-- Filters -->
    <rpl-form />
    <rpl-select />
    <!-- Grid -->
    <div>Search Results</div>
    <rpl-search-results-layout>
      <template v-slot:error>Error Msg</template>
      <template v-slot:count>Count</template>
      <template v-slot:sort>Sort</template>
      <template v-slot:loading>loading</template>
      <template v-slot:results>results</template>
      <template v-slot:noresults>noresults</template>
      <template v-slot:pagination>pagination</template>
    </rpl-search-results-layout>
  </div>
</template>

<script>
import { RplLink } from '@dpc-sdp/ripple-link'
import { RplSelect, RplForm } from '@dpc-sdp/ripple-form'
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
    RplSearchResultsLayout
  },
  props: {
    schema: Object,
    initialState: Object,
    sidebar: {
      type: Boolean,
      default: false
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
    }
  }
}
</script>

<style lang="scss">
.app-content-collection {
  background-color: pink;
}
</style>
