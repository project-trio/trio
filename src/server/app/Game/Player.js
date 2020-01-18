const Util = require('@/server/helpers/util')

module.exports = class Player {

	constructor (socket, game) {
		this.socket = socket
		this.game = game

		const user = socket && socket.user
		this.bot = !user
		if (user) {
			this.user = user
			user.gameData.id = game.id
		} else {
			const botId = `bot-${Util.code()}`
			this.user = {
				id: botId,
				name: botId,
			}
		}

		this.serverUpdate = null
		this.joinCompleted = false

		game.players.push(this)
	}

	removeFromGame (game) {
		if (this.bot) {
			return
		}
		this.user.gameData.id = null
		this.socket.leave(game.id)
		if (this.game === game) {
			this.socket.player = null
		}
	}

}
