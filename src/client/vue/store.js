import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { TESTING } from '@/common/constants'

import storage from '@/client/xjs/storage'

export default new Vuex.Store({
	strict: TESTING,

	state: {
		loading: false,
		signedIn: null,
		email: storage.get('email'),
	},

	actions: {
	},

	mutations: {
	},

	getters: {
	},
})
