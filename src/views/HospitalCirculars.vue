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
        title: "Hospital Circulars",
        description: "Aliqua commodo mollit enim nulla minim sit ut ullamco ea dolore non consectetur eu laborum. ",
        callToAction: { text: 'View all', url: '/search' },
        internal: {
          itemsToLoad: 20,
          contentTypes: ['hospital_circular'],
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
            fields: [
              {
                type: 'basic',
                options: {
                  model: 'field_hospital_date_issued',
                  type: 'rplselect',
                  label: 'Year',
                  placeholder: 'Select a year (not working yet)',
                  values: [
                    { id: '2021', name: '2021' },
                    { id: '2020', name: '2020' }
                  ]
                },
                additionalClasses: [ 'app-content-collection__form-col-3' ],
                'elasticsearch-field': 'type',
                'elasticsearch-aggregation': true
              }
              // {
              //   type: 'basic',
              //   options: {
              //     model: 'field_health_type',
              //     type: 'rplselect',
              //     label: 'Health alert type',
              //     placeholder: 'Select an alert type',
              //     values: [
              //       { id: 'health-alerts', name: 'Alert' },
              //       { id: 'health-advisories', name: 'Advisory' }
              //     ]
              //   },
              //   additionalClasses: [ 'app-content-collection__form-col-3' ],
              //   'elasticsearch-field': 'field_health_type',
              //   'elasticsearch-aggregation': false
              // }
            ]
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
                // field_health_date_issued is not in results atm
                // "date": { "type": "date", "field": "changed", "format": "DD MMM YYYY" },
                "summary": { 
                  "type": "formatted",
                  "fields": [
                    { "type": "date", "field": "field_hospital_date_issued", "format": "DD MMM YYYY" },
                  ],
                  "format": "{field_hospital_date_issued}"
                },
                "subBottom": {
                  "type": "formatted",
                  "fields": [
                    { "type": "text", "field": "field_hospital_issue_number" }
                  ],
                  "format": "Health circular {field_hospital_issue_number}"
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
