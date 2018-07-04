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
		changeEmail: null,
		redirect: false,
		local: {
			name: null,
			email: null,
			ccid: null,
			md5: null,
			admin: false,
			timeMinutely: Date.now() / 1000,
		},
		sessionToken: storage.get('token'),
		registering: false,

		activities: null,
		users: {},
		topics: {},
	},

	actions: {
		SIGNIN ({ state, dispatch, commit }, data) {
			send(commit, 'signin', data, (response) => {
				const signinToken = response.token
				commit('SET_EMAIL', { email: data.email, save: signinToken, registering: !!response.register })
				if (signinToken) {
					commit('SET_SESSION', signinToken)
					if (state.redirect) {
						dispatch('REDIRECT')
					}
				}
			})
		},

		JOIN_HOME ({ commit }) {
			send(commit, 'join home', null, (response) => {
				commit('ACTIVITIES', response.activities)
				commit('USERS', response.users)
				commit('TOPICS', response.topics)
			})
		},

		REDIRECT ({ state, commit }) {
			if (document.referrer && !document.referrer.includes(window.location.host)) {
				const token = state.sessionToken
				if (token) {
					window.location.replace(`${document.referrer}?token=${token}`)
				} else {
					commit('REDIRECT')
				}
			}
		},
	},

	mutations: {
		NOW (state) {
			state.local.timeMinutely = Date.now() / 1000
		},

		RECONNECT (state, attempts) {
			state.reconnectAttempts = attempts
		},

		LOADING (state, loading) {
			state.loading += loading ? 1 : -1
		},

		REDIRECT (state) {
			state.redirect = true
		},

		SET_EMAIL (state, { email, save, registering }) {
			state.changeEmail = email
			if (save || registering) {
				state.registering = registering
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
				if (activity.created_at) {
					if (!activity.r_uids) {
						activity.r_uids = []
						activity.r_emoji = []
					}
					state.activities.unshift(activity)
				} else {
					const id = activity.id
					for (const searchActivity of state.activities) {
						if (searchActivity.id === id) {
							Object.assign(searchActivity, activity)
							break
						}
					}
				}
			}
		},

		USERS (state, users) {
			state.users = users
		},
		USER (state, user) {
			if (state.users) {
				if (user.created_at) {
					state.users[user.id] = user
				} else {
					state.users[user.id].at = user.at
				}
			}
		},

		TOPICS (state, topics) {
			state.topics = topics
		},
		TOPIC (state, topic) {
			if (state.topics) {
				state.topics[topic.id] = topic
			}
		},

		LOCAL_USER (state, { name, email, ccid, md5, admin }) {
			state.local.name = name
			state.local.email = email //TODO return email
			state.local.ccid = ccid
			state.local.md5 = md5
			state.local.admin = admin
		},
	},

	getters: {
		signedIn (state) {
			return state.local.name !== null
		},
	},
})
