import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import HealthAlerts from '../views/HealthAlerts.vue'
import HospitalCirculars from '../views/HospitalCirculars.vue'
import Convictions from '../views/Convictions.vue'

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
  },
  {
    path: '/hospital-circulars',
    name: 'Hospital circulars',
    component: HospitalCirculars
  },
  {
    path: '/convictions',
    name: 'Convictions',
    component: Convictions
  }
]

const router = new VueRouter({
  routes
})

export default router
