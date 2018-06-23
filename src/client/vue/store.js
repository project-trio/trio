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
		reconnectAttempts: null,
		email: storage.get('email'),
		sessionToken: storage.get('token'),
		registering: false,

		activities: null,
		users: {},
	},

	actions: {
		SIGNIN ({ commit }, data) {
			send(commit, 'signin', data, (response) => {
				const signinToken = response.token
				commit('SET_EMAIL', { email: data.email, save: signinToken, registering: !!response.register })
				if (signinToken) {
					commit('SET_SESSION', signinToken)
				}
			})
		},

		JOIN_HOME ({ commit}) {
			send(commit, 'join home', null, (response) => {
				commit('ACTIVITIES', response.activities)
				commit('USERS', response.users)
			})
		},
	},

	mutations: {
		RECONNECT (state, attempts) {
			state.reconnectAttempts = attempts
		},

		LOADING (state, loading) {
			state.loading += loading ? 1 : -1
		},

		SET_EMAIL (state, { email, save, registering }) {
			state.email = email
			if (save || registering) {
				state.registering = registering
			}
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

		USERS (state, users) {
			state.users = users
		},
		USER (state, user) {
			if (state.users) {
				Vue.set(state.users, user.id, user)
			}
		},
	},

	getters: {
	},
})
