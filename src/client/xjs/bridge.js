import io from 'socket.io-client'

import store from '@/client/vue/store'

import storage from '@/client/xjs/storage'

const query = {}
const token = storage.get('token')
if (token) {
	query.token = token
}

const socket = io('/trio', { query })

socket.on('disconnect', () => {
	console.log('disconnected')
	store.commit('RECONNECT', 0)
})
socket.on('reconnecting', (attemptNumber) => {
	store.commit('RECONNECT', attemptNumber)
})
socket.on('reconnect', () => {
	store.commit('RECONNECT', null)
})

socket.on('local', (user) => {
	store.commit('LOCAL_USER', user)
})

socket.on('error', (error) => {
	window.alert(error)
	storage.clear()
	window.location.reload(true)
})

socket.on('update action', ({ activity, user }) => {
	if (activity) {
		store.commit('ACTIVITY', activity)
	}
	if (user) {
		store.commit('USER', user)
	}
})

export default socket
