import Vue from 'vue'

import App from './App.vue'

import router from '@/client/vue/router'
import store from '@/client/vue/store'

Vue.config.productionTip = false

if (document.referrer && window.location.search === '?signin=1') {
	store.dispatch('REDIRECT')
}

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

if (router.currentRoute.query) {
	router.replace({ query: null })
}
