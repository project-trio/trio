const middleware = require.main.require('./helpers/middleware')

const lobby = require('./lobby')

require('./play/loop')

module.exports = (io) => {
	return middleware.namespace(io, 'td', (td, socket) => {
		lobby(td, socket)
	})
}
