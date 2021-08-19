<template>
  <div id="app">
    <content-collection :schema="schema" />
  </div>
</template>

<script>
import ContentCollection from './components/ContentCollection.vue'

export default {
  name: 'App',
  components: {
    ContentCollection
  },
  data () {
    return {
      schema: {
        title: "hello world!",
        description: "Desc",
        callToAction: { text: 'View all', url: '/search' },
        internal: {
          itemsToLoad: 10,
          // contentIds: [123,567],
          contentTypes: ['landing_page'],
          custom: {
            'query': {
              'bool': {
                'must': [
                  // Keyword Query
                  {
                    "multi_match": {
                      'query': 'demo',
                      'type': 'phrase_prefix',
                      'fields': ['body', 'field_landing_page_summary', 'field_page_intro_text', 'field_paragraph_body', 'field_paragraph_summary', 'summary_processed', 'title']
                    }
                  },
                ],
                'filter': [
                  // Filter by Site ID - should always be added.
                  { 'terms': { 'field_node_site': ['4'] } },
                  // internal.contentIds
                  // { 'terms': { 'nid': ['4427'] } },
                  // internal.contentTypes
                  { 'terms': { 'type': ['landing_page'] } },
                  // internal.contentFields
                  // { 'terms': { 'field_topic': ['439', '4223', '601'] } },
                  { 'terms': { 'field_tags': ['108'] } },
                  // internal.dateFilter
                  // { 'range': { 'created': { gte: '2021-08-18T00:00:00+10:00' } } },
                  // { 'range': { 'created': { lte: '2021-08-18T23:59:59+10:00' } } },
                ],
                'must_not': [
                  // internal.includeCurrentPage = false
                  // { 'match': { 'nid': '13335' } },
                  // internal.excludeIds
                  // { 'match': { 'nid': '14885' } },
                ]
              }
            },
            // internal.sort
            'sort': [{ 'title.keyword': 'asc' }]
          }
        }
      }
    }
  }
}
</script>
