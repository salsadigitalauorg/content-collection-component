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
      <template v-slot:count>{{ resultCount }}</template>
      <template v-slot:sort>
        <rpl-content-collection-select
          v-for="(fieldData, controlFieldId) in controlFields"
          :key="`${controlFieldId}-control-form`"
          v-bind="fieldData"
          @change="controlChange(fieldData.model, $event)"
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
      <template v-slot:pagination>pagination</template>
    </rpl-search-results-layout>
    <hr/>
  </div>
</template>

<script>
import { RplLink } from '@dpc-sdp/ripple-link'
import { RplForm } from '@dpc-sdp/ripple-form'
import RplContentCollectionSelect from './ContentCollectionSelect.vue'
import { RplCol } from '@dpc-sdp/ripple-grid'
import provideChildCols from '@dpc-sdp/ripple-global/mixins/ProvideChildCols'
import ContentCollection from '../lib/content-collection.js'
import { RplSearchResultsLayout, RplSearchResult } from '@dpc-sdp/ripple-search'
import { RplCardPromo } from '@dpc-sdp/ripple-card'
// TODO - We need to figure out how custom result components can be loaded.

export default {
  name: 'AppContentCollection',
  mixins: [provideChildCols],
  components: {
    RplLink,
    RplForm,
    RplContentCollectionSelect,
    RplCol,
    RplSearchResultsLayout,
    RplSearchResult,
    RplCardPromo
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
    const exposedFilterForm = dataManager.getExposedFilterForm()
    const controlFields = dataManager.getControlFields()
    return {
      dataManager,
      controlFields,
      state: {
        page: 1,
        itemsToLoad: 10
      },
      results: [],
      exposedFilterFormData: exposedFilterForm
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
    resultComponentName () {
      return this.dataManager.getDisplayResultComponentName()
    },
    resultColumns () {
      return this.dataManager.getDisplayResultComponentColumns()
    }
  },
  methods: {
    async getResults () {
      const response = await this.dataManager.getResults(this.state)
      console.table(response)
      this.results = response
    },
    controlChange (form, value) {
      // TODO - Convert to Query String
      console.log(form, value)
      this.state[form] = value
      this.updateQuery()
    },
    exposedFilterFormSubmit () {
      // TODO - Convert to Query String
      console.log(this.exposedFilterFormData.model)
      const query = { q: this.exposedFilterFormData.model.q }
      this.$router.replace({ query })
    }
  },
  watch: {
    $route (to, from) {
      // TODO - Update the state + form
      this.state.q = to.query.q ? to.query.q : ''
      this.exposedFilterFormData.model.q = this.state.q
      this.getResults()
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
