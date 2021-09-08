<template>
  <div>
    <div class="controls">
      <label>
        <span>elasticsearch:</span>
        <textarea v-model="customES"></textarea>
      </label>
      <label>
        <span>Environment:</span>
        <textarea v-model="customEnvironment"></textarea>
      </label>
      <label>
        <span>Schema:</span>
        <textarea v-model="customSchema"></textarea>
      </label>
      <button @click="updateSchema">Update Schema</button>
    </div>
    <div class="display">
      <content-collection v-if="schema" :schema="schema" :environment="environment" :key="count"/>
    </div>
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
      customES: `{
  "SEARCH_URL": "elastic.sdp2.sdp.vic.gov.au",
  "SEARCH_AUTH_USERNAME": "",
  "SEARCH_AUTH_PASSWORD": "",
  "SEARCH_INDEX": "elasticsearch_index_nonprod_node",
  "SEARCH_HASH": "a83890f7a31dea14e1ae83c6f0afacca"
}`,
      customEnvironment: `{
  "siteId": "4",
  "primarySiteId": "4",
  "domains": { "4": "" }
}`,
      customSchema: `{
  "title": "Content Collection",
  "internal": {
    "itemsToLoad": 12,
    "contentTypes": ["news"],
    "dateFilter": {
      "criteria": "range",
      "startDateField": "created",
      "endDateField": "created",
      "dateRangeStart": "2021-01-01T00:00:00+10:00",
      "dateRangeEnd": "2021-01-31T23:59:59+10:00"
    },
    "sort": [
      { "field": "created", "direction": "desc" }
    ]
  },
  "interface": {
    "display": {
      "type": "grid",
      "options": {
        "pagination": {
          "type": "numbers"
        }
      },
      "resultComponent": {
        "type": "card"
      }
    }
  }
}`,
      environment: null,
      schema: null,
      count: 0
    }
  },
  methods: {
    updateSchema () {
      const es = JSON.parse(this.customES)
      if (es) {
        this.$tideSearchApi.setParams(es)
      }
      const environment = JSON.parse(this.customEnvironment)
      if (environment) {
        this.environment = environment
      }
      const schema = JSON.parse(this.customSchema)
      if (schema) {
        this.schema = schema
      }
      this.count++
    }
  },
  mounted () {
    this.updateSchema()
  }
}
</script>

<style lang="scss">
.controls {
  background-color: lightgrey;
  padding: 22px;

  textarea {
    box-sizing: border-box;
    width: 100%;
    height: 150px;
    font-family: monospace;
  }
}
.display {
  padding: 22px;
}
</style>
