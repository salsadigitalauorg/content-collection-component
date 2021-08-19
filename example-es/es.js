const elasticsearch = require('elasticsearch')
// =============================================================================
const SEARCH_INDEX = 'elasticsearch_index_nonprod_node'
const SEARCH_HASH = '2a432d2d6146895f9ad3ce4b94b3ddac'
const SEARCH_URL = 'elastic.sdp2.sdp.vic.gov.au'
const SEARCH_AUTH_USERNAME = 'dpc'
const SEARCH_AUTH_PASSWORD = 'ezh7BnY7'

const url = 'https://' + SEARCH_HASH + '.' + SEARCH_URL
const testESOptions = {
  host: url,
  log: 'trace',
  apiVersion: '6.8',
  httpAuth: `${SEARCH_AUTH_USERNAME}:${SEARCH_AUTH_PASSWORD}`
}
const esClient = new elasticsearch.Client(testESOptions)
// =============================================================================
async function search() {
  try {
    const response = await esClient.search({
      from: 0,
      size: 30,
      index: SEARCH_INDEX,
      filterPath: ['hits.hits', 'hits.total'],
      body: {
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
      },
      _source: []
    });
    console.log(JSON.stringify(response.hits.hits.map(({ _source }) => `title: ${_source.title}`), null, 2))
  } catch (error) {
    console.trace(error.message)
  }
}

// =============================================================================
search()