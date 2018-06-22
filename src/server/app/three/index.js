const signin = require('./signin')

module.exports = (io) => {
	io.of('/three').on('connection', (socket) => {
		if (!socket.user) {
			signin(socket)
		}
	})
}
