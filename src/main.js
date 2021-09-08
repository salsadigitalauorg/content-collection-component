import Vue from 'vue'
import App from './App.vue'
import '@dpc-sdp/ripple-global/style.scss'
import RplGlobal from '@dpc-sdp/ripple-global'
import router from './router'
import elasticSearch from './lib/es.js'
import VhSearchResult from './components/VhSearchResult.vue'

Vue.config.productionTip = false

Vue.use(RplGlobal, {})
Vue.component('vh-search-result', VhSearchResult)

// Mock Tide Search API.
const tideSearchApi = {
  searchByPost (body) {
    return elasticSearch.search(body)
  },
  setParams (params) {
    elasticSearch.setESParams(params)
  }
}
Vue.mixin({
  beforeCreate() {
    const options = this.$options;
    if ( options.tideSearchApi ) {
      this.$tideSearchApi = options.tideSearchApi;
    } else if ( options.parent && options.parent.$tideSearchApi ) {
      this.$tideSearchApi = options.parent.$tideSearchApi;
    }
  }
});

new Vue({
  router,
  tideSearchApi,
  render: h => h(App)
}).$mount('#app')
