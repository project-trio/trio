import TrioClient from '@ky-is/trio-client'

import store from '@/client/vue/store'

import storage from '@/client/xjs/storage'

const socket = TrioClient.connectTo('trio', store.state.sessionToken, (token) => {
}, (user) => {
	store.commit('LOCAL_USER', user)
}, (reconnectAttempts) => {
	store.commit('RECONNECT', reconnectAttempts)
}, (error) => {
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
