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
	const signinRoute = toName === 'Signin' || toName === 'Passcode'
	if (signinRoute) {
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

function isEmpty (obj) {
	for (const _ in obj) {
		return false
	}
	return true
}

// SETUP

if (!isEmpty(router.currentRoute.query)) {
	router.replace({ query: null })
}
