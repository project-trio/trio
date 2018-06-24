import Vue from 'vue'

import App from './App.vue'

import router from '@/client/vue/router'
import store from '@/client/vue/store'

require('vue-multiselect/dist/vue-multiselect.min.css')

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
	const toName = to.name
	const hasSignin = !!store.state.sessionToken
	if (toName === 'Signin') {
		if (hasSignin) {
			return next({ name: 'Home' })
		}
	} else {
		if (!hasSignin) {
			return next({ name: 'Signin' })
		}
	}
	next()
})

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')

//INIT

if (router.currentRoute.query.signin && document.referrer) {
	const token = store.state.sessionToken
	if (token) {
		const baseUrl = document.referrer.split('/?')[0]
		window.location.replace(`${baseUrl}?token=${token}`)
	}
}
