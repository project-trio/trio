import Vue from 'vue'

import App from './App.vue'

import router from '@/client/vue/router'
import store from '@/client/vue/store'

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
	const toName = to.name
	const hasEmail = !!store.state.email
	if (toName === 'Signin') {
		if (hasEmail) {
			return next({ name: 'Home' })
		}
	} else {
		if (!hasEmail) {
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
