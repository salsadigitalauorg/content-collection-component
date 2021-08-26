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
      // Aggregations
      // TODO - Some of this needs to be in ContentCollection, some here.
      Object.keys(response.aggregations).forEach(model => {
        this.exposedFilterFormData.schema.groups.forEach(group => {
          group.fields.forEach(field => {
            if (field.model === model) {
              const buckets = response.aggregations[model].buckets
              if (buckets.length > 0) {
                field.values = buckets.map(({ key, doc_count }) => ({ id: key, name: `${key} (${doc_count})` }))
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
  &__header {
    @include rpl-breakpoint('m') {
      display: flex;
      justify-content: space-between;
      width: 100%;
      &-left {
        p:first-child {
          margin-top: 0;
        }
      }
      &-right {
        .rpl-link {
          white-space: nowrap;
          display: inline
        }
      }
    }
    &-right {
      .rpl-link {
        white-space: nowrap;
        margin-bottom: $rpl-space * 5;
        display: inline-block;
      }
    }
  }

  &__heading {
    @include rpl_typography('heading_l');
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
    margin-left: -$rpl-space-3;
    margin-right: -$rpl-space-3;
    width: calc(100% + $rpl-space-3 * 2);
  }

  &__form-col-full, &__submit {
    margin-left: .75rem;
    margin-right: .75rem;
    width: 100%;
  }

  &__form-col-2 {
    margin-left: .75rem;
    margin-right: .75rem;
    width: 100%;
    @include rpl-breakpoint('m') {
      width: calc(50% - 1.5rem);
    }
  }

  &__form-col-3 {
    margin-left: .75rem;
    margin-right: .75rem;
    width: 100%;
    @include rpl-breakpoint('m') {
      width: calc(50% - 1.5rem);
    }
    @include rpl-breakpoint('l') {
      width: calc(33.33% - 1.5rem);
    }
  }

  &__form-col-4 {
    margin-left: .75rem;
    margin-right: .75rem;
    width: 100%;
    @include rpl-breakpoint('m') {
      width: calc(50% - 1.5rem);
    }
    @include rpl-breakpoint('l') {
      width: calc(25% - 1.5rem);
    }
  }

  &__form-inline {
    display: inline-block;
  }

  &__form-inline + &__form-inline {
    margin-left: $rpl-space * 6;
  }

  .rpl-search-results-layout__sort {
    margin-left: .75rem;
    margin-right: .75rem;
    width: 100%;

    .rpl-form {
      .form-group {
        width: 100%;
        @include rpl-breakpoint('m') {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: auto;
          label:not(.rpl-option-button__label) {
            margin-bottom: 0;
            margin-right: $rpl-space-3;
          }
          .rpl-select__trigger {
            padding-right: $rpl-space-4 * 3;
          }
        }
      }
    }
    .app-content-collection__form-inline + .app-content-collection__form-inline {
      margin-left: 0;
      @include rpl-breakpoint('m') {
        margin-left: $rpl-space * 6;
      }
    }
  }

  .rpl-search-results-layout__header {
    display: block;
  }

  .rpl-clearform {
    padding-top: $rpl-space-3;
    padding-bottom: $rpl-space-3;
  }
}
</style>
