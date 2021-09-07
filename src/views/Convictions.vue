<template>
  <div id="app">
    <content-collection :schema="schema" :environment="environment" />
  </div>
</template>

<script>
import ContentCollection from '../components/ContentCollection.vue'

export default {
  name: 'App',
  components: {
    ContentCollection
  },
  data () {
    return {
      environment: {
        siteId: '4',
        primarySiteId: '4',
        domains: { '4': '' }
      },
      schema: {
        title: "",
        description: "",
        callToAction: { text: '', url: '' },
        internal: {
          itemsToLoad: 20,
          contentTypes: ['conviction_record'],
          sort: [
            { field: 'created', direction: 'desc' }
          ]
        },
        interface: {
          keyword: {
            type: 'basic',
            label: 'Search by keyword',
            placeholder: 'Enter keyword(s)'
          },
          filters: {
            submit: {
              visibility: 'visible',
              label: 'Apply change'
            },
            clearForm: {
              visibility: 'visible',
              label: 'Clear search'
            },
            fields: []
          },
          display: {
            type: 'grid',
            options: {
              resultsCountText: 'Displaying {range} of {count} results',
              loadingText: 'Loading',
              noResultsText: 'Sorry! We couldn\'t find any matches',
              errorText: 'Search isn\'t working right now, please try again later.',
              sort: {
                type: 'field',
                values: [
                  { "name": "Relevance", "value": null },
                  { "name": "Title A-Z", "value": [ { "field": "title.keyword", "direction": "asc" } ] },
                  { "name": "Title Z-A", "value": [ { "field": "title.keyword", "direction": "desc" } ] },
                  { "name": "Newest", "value": [ { "field": "created", "direction": "desc" } ] },
                  { "name": "Oldest", "value": [ { "field": "created", "direction": "asc" } ] }
                ]
              },
              itemsToLoad: {
                type: 'field',
                values: [
                  { "name": "1", "value": 1 },
                  { "name": "2", "value": 2 },
                  { "name": "5", "value": 5 },
                  { "name": "10", "value": 10 },
                  { "name": "20", "value": 20 },
                  { "name": "50", "value": 50 },
                  { "name": "All", "value": 9999 }
                ]
              },
              pagination: {
                type: 'numbers'
              }
            },
            resultComponent: {
              type: 'vh-search-result',
              options: {
                "title": { "type": "text", "field": "title" },
                "subTop": {
                  "type": "formatted",
                  "fields": [
                    { "type": "date", "field": "field_date_of_conviction", "format": "DD MMM YYYY" },
                  ],
                  "format": "Date of conviction: {field_date_of_conviction}"
                },
                "summary": { 
                  "type": "formatted",
                  "fields": [
                    { "type": "text", "field": "field_name_of_convicted" },
                    { "type": "text", "field": "field_address" },
                    { "type": "text", "field": "field_prosecution_brought_by" }
                  ],
                  "format": "{field_name_of_convicted} | {field_address} | {field_prosecution_brought_by}"
                },
                "subBottom": {
                  "type": "formatted",
                  "fields": [
                    { "type": "text", "field": "field_conviction_number" }
                  ],
                  "format": "Conviction number {field_conviction_number}"
                }
              },
            }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  padding: 22px;
}
</style>
