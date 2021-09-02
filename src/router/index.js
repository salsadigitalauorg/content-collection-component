import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import HealthAlerts from '../views/HealthAlerts.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/health-alerts',
    name: 'Health alerts',
    component: HealthAlerts
  }
]

const router = new VueRouter({
  routes
})

export default router
