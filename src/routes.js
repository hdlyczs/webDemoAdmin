import Vue from 'vue'
import VueRouter from 'vue-router'
//
import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
// 自己新添
import customer from './views/nav3/customer'
import worker from './views/nav3/worker'
import sensitiveEdit from './views/nav3/sensitiveEdit'
import search from './views/nav3/search'
import admin from './views/admin/admin'
import menu from './views/menu/menu'
import news from './views/news/news'
import product from './views/product/product'
import advantage from './views/advantage/advantage'
import banner from './views/banner/banner'

Vue.use(VueRouter)

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path:'/',
        component: Home,
        name: '',
        iconCls: 'iconfont icon-kehuziliao1',
        leaf: true,//只有一个节点
        children: [
            { path: '/admin', component: admin, name: '管理员' }
        ]
    },
    {
        path:'/',
        component:Home,
        name:'',
        iconCls:'iconfont icon-bianji',
        leaf:true,
        children: [
            {path:'/menu', component:menu, name:'菜单配置' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'iconfont icon-tupian1',
        leaf: true,//只有一个节点
        children: [
            { path: '/banner', component: banner, name: '轮播图配置' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'iconfont icon-xinwen',
        leaf: true,//只有一个节点
        children: [
            { path: '/news', component: news, name: '新闻列表' }
        ],
        hidden:false
    },
    {
        path:'/',
        component: Home,
        name: '',
        iconCls: 'iconfont icon-chanpin1',
        leaf: true,//只有一个节点
        children: [
            { path: '/product', component: product, name: '广告配置' }
        ],
        hidden:false
    },
    {
        path:'/',
        component:Home,
        name:'',
        iconCls:'iconfont icon-tuiguangyoushi',
        leaf:true,
        children: [
            {path:'/advantage', component:advantage, name:'我们的优势' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default new VueRouter({
    routes
});