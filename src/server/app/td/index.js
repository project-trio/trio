const middleware = require.main.require('./helpers/middleware')

const lobbyEvents = require('./events/lobby')
const playEvents = require('./events/play')

module.exports = (io) => {
	const td = middleware.namespace(io, 'td', (socket) => {
		lobbyEvents(td, socket)
		playEvents(td, socket)
	})

	require('./Game/loop')()

	return td
}
