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
        title: "Health Alerts",
        description: "Aliqua commodo mollit enim nulla minim sit ut ullamco ea dolore non consectetur eu laborum. Aliqua commodo mollit enim nulla minim sit ut ullamco ea dolore non consectetur eu laborum. Aliqua commodo mollit enim nulla minim sit ut ullamco ea dolore non consectetur eu laborum. ",
        callToAction: { text: 'View all', url: '/search' },
        internal: {
          itemsToLoad: 20,
          // contentIds: ['7', '10', 15211, 14809],
          contentTypes: ['health_alert'],
          contentFields: {
            // field_topic: { operator: 'AND', values: ['110', '439', '4223', '601'] },
            // field_tags: { operator: 'AND', values: ['108'] }
          },
          dateFilter: {
            criteria: 'this_month',
            startDateField: 'created',
            endDateField: 'created',
            dateRangeStart: '2021-01-17T00:00:00+10:00',
            dateRangeEnd: '2021-12-19T23:59:59+10:00'
          },
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
                  model: 'type',
                  type: 'rplselect',
                  label: 'Type',
                  hint: 'The content type to filter by',
                  placeholder: 'Select type',
                  values: [
                    { id: 'landing_page', name: 'Landing Page' },
                    { id: 'record_page', name: 'Record Page' },
                    { id: 'conviction_record', name: 'Conviction Record' },
                    { id: 'health_alert', name: 'Health Alert' }
                  ]
                },
                additionalClasses: [ 'app-content-collection__form-col-3' ],
                'elasticsearch-field': 'type',
                'elasticsearch-aggregation': false
              },
              {
                type: 'basic',
                options: {
                  model: 'field_tags_name',
                  type: 'rplselect',
                  multiselect: true,
                  label: 'Tags',
                  placeholder: 'Select some tags',
                  values: []
                },
                additionalClasses: [ 'app-content-collection__form-col-3' ],
                'elasticsearch-field': 'field_tags_name',
                'elasticsearch-aggregation': true
              },
              {
                type: 'basic',
                options: {
                  model: 'field_topic_name',
                  type: 'rplselect',
                  multiselect: true,
                  label: 'Topic',
                  placeholder: 'Select a topic',
                  values: []
                },
                additionalClasses: [ 'app-content-collection__form-col-3' ],
                'elasticsearch-field': 'field_topic',
                'elasticsearch-aggregation': true
              }
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
              // type: 'search-result'
              // type: 'card'
              type: 'vh-search-result',
              options: {
                "title": { "type": "text", "field": "title" },
                // field_health_date_issued is not in results atm
                // "date": { "type": "date", "field": "changed", "format": "DD MMM YYYY" },
                "summary": { 
                  "type": "formatted",
                  "fields": [
                    { "type": "date", "field": "changed", "format": "DD MMM YYYY" },
                    { "type": "text", "field": "field_health_type" },
                    { "type": "date", "field": "created", "format": "DD MMMM YYYY" },
                  ],
                  "format": "{changed} - Update to <code>{field_health_type}</code> issued {created}"
                },
                "subBottom": {
                  "type": "formatted",
                  "fields": [
                    { "type": "text", "field": "field_health_status" },
                    { "type": "text", "field": "field_health_type" },
                    { "type": "text", "field": "field_health_alert_number" },
                  ],
                  "format": "{field_health_status} | {field_health_type} {field_health_alert_number}"
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
