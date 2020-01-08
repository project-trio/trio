import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/client/views/Home'
import Passcode from '@/client/views/Passcode'
import Signin from '@/client/views/Signin'

Vue.use(Router)

export default new Router({
	mode: 'history',

	routes: [
		{
			path: '/',
			name: 'Home',
			component: Home,
		},

		{
			path: '/signin',
			name: 'Signin',
			component: Signin,
		},
		{
			path: '/passcode/:email/:passcode',
			name: 'Passcode',
			component: Passcode,
			props (route) {
				return {
					email: route.params.email,
					passcode: route.params.passcode,
				}
			},
		},

		{
			path: '/user/:name',
			name: 'User',
			component: Home,
			props (route) {
				return {
					user: route.params.name,
				}
			},
		},
		{
			path: '/topic/:name',
			name: 'Topic',
			component: Home,
			props (route) {
				return {
					topic: route.params.name,
				}
			},
		},
	],
})
