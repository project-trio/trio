const global = require.main.require('./helpers/global')
const middleware = require.main.require('./helpers/middleware')

const home = require('./home')
const signin = require('./signin')

module.exports = (io) => {
	return middleware.namespace(io, 'three', (socket) => {
		if (!socket.user) {
			signin(socket)
		}
		home(socket)
		socket.on('disconnect', () => {
			global.disconnect(socket.user)
		})
	})
}
