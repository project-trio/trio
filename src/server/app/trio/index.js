const { TESTING } = require.main.require('../common/constants')

const middleware = require.main.require('./helpers/middleware')

const home = require('./home')
const signin = require('./signin')

module.exports = (io) => {
	const trio = middleware.namespace(io, 'trio', (socket) => {
		if (!socket.user) {
			signin(socket)
		} else if (TESTING || socket.user.admin) {
			socket.on('admin', (data, callback) => {
				callback({}) //TODO
			})
		}
		home(socket)
	})

	return trio
}
