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

socket.on('error', (error) => {
	console.log(error)
	storage.clear()
	window.location.reload(true)
})

socket.on('activity', (activity) => {
	store.commit('ACTIVITY', activity)
})
socket.on('user', (user) => {
	store.commit('USER', user)
})

export default socket
