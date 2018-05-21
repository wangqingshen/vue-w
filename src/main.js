import Vue from 'vue'
import Router from 'vue-router'
// import FastClick from 'fastclick'
import $ from 'jquery'
// import 'bootstrap/dist/css/bootstrap.min.css'  
// import 'bootstrap/dist/js/bootstrap.min'
import 'bootstrap/js/bootstrap.min.js'
// import '../static/js/validate.js'
import 'bootstrap/css/bootstrap.min.css'
import '../static/less/common.less'
import Vum from 'vum'
import global_ from '../src/components/Global'
// import VueWebsocket from "vue-websocket"
import axios from 'axios'

// router
import IpCheck from './pages/IpCheck'
import Login from './pages/Login'
import Home from './pages/Home'
import Setting from './pages/Setting'
import About from './pages/About'
import ChangePwd from './pages/ChangePwd'
import Channel from './pages/Channel'
import Order from './pages/Order'
import Payment from './pages/Payment'
import Shopping from './pages/Shopping'

Vue.use(Router)
Vue.use(Vum)
Vue.prototype.GLOBAL = global_;
Vue.prototype.$http = axios;
axios.defaults.withCredentials = true;
// Vue.use(VueWebsocket);
let router = new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'index',
    //   component: Index
    // },
    {
      path: '/',
      name: 'ipCheck',
      meta: {
        requireLogin: true
      },
      component: IpCheck
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        requireLogin: true
      },
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      meta: {
        requireAuth: true
      },
      component: Home
    },
    {
      path: '/setting',
      name: 'setting',
      meta: {
        requireAuth: true
      },
      component: Setting
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        requireAuth: true
      },
      component: About
    },
    {
      path: '/changePwd',
      name: 'changePwd',
      meta: {
        requireAuth: true
      },
      component: ChangePwd
    },
    {
      path: '/channel',
      name: 'channel',
      meta: {
        requireAuth: true
      },
      component: Channel
    },
    {
      path: '/order',
      name: 'order',
      meta: {
        requireAuth: true
      },
      component: Order
    },
    {
      path: '/payment',
      name: 'payment',
      meta: {
        requireAuth: true
      },
      component: Payment
    },
    {
      path: '/shopping',
      name: 'shopping',
      meta: {
        requireAuth: true
      },
      component: Shopping
    },
  ]
})
router.beforeEach((to, from, next) => {
  // if(navigator.userAgent.indexOf('Wemew') == -1) {
  //     alert('请在指定的应用程序中打开该地址');
  //     return false;
  // }
  if (to.matched.some(res => res.meta.requireAuth)) { // 判断是否需要登录权限
    if (localStorage.getItem('username')) { // 判断是否登录
      next()
    } else { // 没登录则跳转到登录界面
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
    }
  } else if (to.matched.some(res => res.meta.requireLogin)) {
    if (localStorage.getItem('username')) {
      //登录了则跳转home页面
      next({
        path: '/home',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  }
})

/*全局获取权限函数*/
Vue.prototype.authority = function(b) {
  // var a = localStorage.getItem('permission');
  // if(a.indexOf(b) == -1) {
  //   return false;
  // }
  return true;
}

new Vue({
  router
}).$mount('#app')

Vum.router(router) // config router by vum

// FastClick.attach(document.body)


window.onunload = function(event) {
  if (event.clientX <= 0 && event.clientY < 0) {
    let self = this;
    $.ajax({
      type: "GET",
      async: false,
      url: localStorage.getItem('apiurl') + '/padinterface/logout',
      xhrFields: {
        withCredentials: true
      },
      dataType: "json",
      success: function(data) {
        if (data.code == 0) {
          localStorage.removeItem("username");
          localStorage.removeItem("userid");
        }
      }
    })
  }
}
