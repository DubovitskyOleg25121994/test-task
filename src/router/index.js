import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login/index.vue'
import ContactsManager from '@/components/ContactsManager/index.vue'
import { store } from '../store/index'

Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.IS_AUTHENTICATED) {
    next()
    return
  }
  next('/')
}

const ifAuthenticated = (to, from, next) => {
  if (store.getters.IS_AUTHENTICATED || localStorage.getItem('token')) {
    next()
    return
  }
  next('/')
}

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      beforeEnter: ifNotAuthenticated
    },
    {
      path: '/contacts-manager',
      name: 'contactsManeger',
      component: ContactsManager,
      beforeEnter: ifAuthenticated
    }
  ]
})

export default router
