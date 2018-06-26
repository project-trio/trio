const middleware = require.main.require('./helpers/middleware')

const lobbyEvents = require('./events/lobby')
const playEvents = require('./events/play')

require('./Game/loop')()

module.exports = (io) => {
	return middleware.namespace(io, 'td', (td, socket) => {
		lobbyEvents(td, socket)
		playEvents(td, socket)
	})
}
