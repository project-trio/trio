import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { TESTING } from '@/common/constants'

import router from '@/client/vue/router'

import bridge from '@/client/xjs/bridge'
import storage from '@/client/xjs/storage'

const send = (commit, name, data, callback) => {
	commit('LOADING', true)
	bridge.emit(name, data, (response) => {
		callback(response)
		commit('LOADING', false)
	})
}

export default new Vuex.Store({
	strict: TESTING,

	state: {
		loading: 0,
		email: storage.get('email'),
		sessionToken: storage.get('token'),

		activities: null,
	},

	actions: {
		SIGNIN ({ commit }, { email, passcode }) {
			send(commit, 'signin', { email, passcode }, (response) => {
				commit('SET_EMAIL', { email, save: passcode })
				if (response.token) {
					commit('SET_SESSION', response.token)
				}
			})
		},

		JOIN_HOME ({ commit}) {
			send(commit, 'join home', null, (response) => {
				commit('ACTIVITIES', response.activities)
			})
		},
	},

	mutations: {
		LOADING (state, loading) {
			state.loading += loading ? 1 : -1
		},

		SET_EMAIL (state, { email, save }) {
			state.email = email
			if (save) {
				storage.set('email', email)
			}
		},

		SET_SESSION (state, token) {
			state.sessionToken = token
			storage.set('token', token)
			router.replace({ name: 'Home' })
		},

		ACTIVITIES (state, activities) {
			state.activities = activities
		},
		ACTIVITY (state, activity) {
			if (state.activities) {
				state.activities.unshift(activity)
			}
		},
	},

	getters: {
	},
})
