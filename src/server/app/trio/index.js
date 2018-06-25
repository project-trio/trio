const middleware = require.main.require('./helpers/middleware')

const home = require('./home')
const signin = require('./signin')

module.exports = (io) => {
	return middleware.namespace(io, 'trio', (trio, socket) => {
		if (!socket.user) {
			signin(socket)
		}
		home(socket)
	})
}
