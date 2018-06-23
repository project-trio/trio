const middleware = require.main.require('./helpers/middleware')

const home = require('./home')
const signin = require('./signin')

module.exports = (io) => {
	middleware.namespace(io, 'three', (socket) => {
		if (!socket.user) {
			signin(socket)
		}
		home(socket)
	})
}
