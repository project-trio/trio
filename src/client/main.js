import Vue from 'vue'

import App from './App.vue'

import router from '@/client/vue/router'
import store from '@/client/vue/store'

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
	const toName = to.name
	const signedIn = !!store.state.sessionToken
	if (toName === 'Signin') {
		if (signedIn) {
			return next({ name: 'Home' })
		}
	} else {
		if (!signedIn) {
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
