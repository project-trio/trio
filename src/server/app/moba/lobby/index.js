const Game = require('../Game')

module.exports = {

	broadcastWith (io, withPlayers, withGames) {
		const data = {}
		if (withPlayers) {
			data.online = 0 //TODO
		}
		if (withGames) {
			data.games = Game.getList()
		}
		io.to('lobby').emit('lobby', data)
	},

}
