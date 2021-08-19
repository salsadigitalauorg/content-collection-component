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
        callToAction: { text: 'View all', url: 'text' },
        internal: {
          custom: {
            query: {
              'bool': {
                'must': [
                  {
                    // Keyword Query
                    "multi_match": {
                      'query': 'demo alert',
                      'fields': ['body', 'field_landing_page_summary', 'field_page_intro_text', 'field_paragraph_body', 'field_paragraph_summary', 'summary_processed', 'title']
                    }
                  },
                ],
                // Filter by Site ID
                'filter': { 'terms': { 'field_node_site': ['4'] } }
              }
            },
            sort: []
          }
        }
      }
    }
  }
}
</script>
