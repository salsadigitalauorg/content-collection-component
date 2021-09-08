const elasticsearch = require('elasticsearch')

let SEARCH_URL = ''
let SEARCH_AUTH_USERNAME = ''
let SEARCH_AUTH_PASSWORD = ''
let SEARCH_INDEX = ''
let SEARCH_HASH = ''

module.exports = {
  setESParams (esParams) {
    SEARCH_URL = esParams.SEARCH_URL
    SEARCH_AUTH_USERNAME = esParams.SEARCH_AUTH_USERNAME
    SEARCH_AUTH_PASSWORD = esParams.SEARCH_AUTH_PASSWORD
    SEARCH_INDEX = esParams.SEARCH_INDEX
    SEARCH_HASH = esParams.SEARCH_HASH
  },
  async search (esRequest) {
    const url = 'https://' + SEARCH_HASH + '.' + SEARCH_URL
    const testESOptions = {
      host: url,
      // log: 'trace',
      apiVersion: '7.6',
      httpAuth: `${SEARCH_AUTH_USERNAME}:${SEARCH_AUTH_PASSWORD}`
    }
    const esClient = new elasticsearch.Client(testESOptions)

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
}
