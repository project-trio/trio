import io from 'socket.io-client'

import store from '@/client/vue/store'

import storage from '@/client/xjs/storage'

const query = {}
const token = storage.get('token')
if (token) {
	query.token = token
}

const socket = io('/three', { query })

socket.on('error', (error) => {
	console.log(error)
	store.commit('LOADING', false)
})

socket.on('activity', (activity) => {
	store.commit('ACTIVITY', activity)
})
socket.on('user', (user) => {
	store.commit('USER', user)
})

export default socket
