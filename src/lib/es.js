const elasticsearch = require('elasticsearch')

const SEARCH_INDEX = 'elasticsearch_index_nonprod_node'
const SEARCH_HASH = '2a432d2d6146895f9ad3ce4b94b3ddac'
const SEARCH_URL = 'elastic.sdp2.sdp.vic.gov.au'
const SEARCH_AUTH_USERNAME = 'dpc'
const SEARCH_AUTH_PASSWORD = 'ezh7BnY7'

const url = 'https://' + SEARCH_HASH + '.' + SEARCH_URL
const testESOptions = {
  host: url,
  // log: 'trace',
  apiVersion: '7.6',
  httpAuth: `${SEARCH_AUTH_USERNAME}:${SEARCH_AUTH_PASSWORD}`
}
const esClient = new elasticsearch.Client(testESOptions)

module.exports = async function elasticSearch (esRequest) {
  try {
    const req = {}
    req.index = (esRequest.index === undefined) ? SEARCH_INDEX : esRequest.index
    req.from = esRequest.from
    req.size = esRequest.size
    req._source = esRequest._source
    req.body = {
      query: esRequest.query,
      sort: esRequest.sort,
      aggs: esRequest.aggs
    }
    const response = await esClient.search(req)
    return response
  } catch (error) {
    console.trace(error.message)
    return null
  }
}
