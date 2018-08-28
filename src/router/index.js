import Vue from 'vue'
import Router from 'vue-router'
import UpdateTable from '@/components/UpdateTable'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'UpdateTable',
      component: UpdateTable
    }
  ]
})
