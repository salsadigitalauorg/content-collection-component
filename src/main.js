import Vue from 'vue'
import App from './App.vue'
import '@dpc-sdp/ripple-global/style.scss'
import RplGlobal from '@dpc-sdp/ripple-global'

Vue.config.productionTip = false

Vue.use(RplGlobal, {})

new Vue({
  render: h => h(App),
}).$mount('#app')
