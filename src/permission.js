import router from './routes.js'
import store from './vuex/store'
import Cookies from 'js-cookie'

router.beforeEach((to, from, next) => {
	const isCookies = !(typeof(Cookies.get('userName')) == 'undefined');//false表示没有Cookies;true表示Cookies存在
	if (to.path == '/login') {
		next()
	}else{
		if (isCookies) {
			next()
		} else {
			next({ path: '/login' })
		}
	}
})