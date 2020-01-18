const { getTimestamp } = require('@/common/utils')

const Config = require('../config')

//PUBLIC

module.exports = function (io, socket) {
	socket.on('switch unit', (data) => {
		const player = socket.player
		if (!player || !player.game) {
			console.log('Action ERR: No game for player')
			return
		}
		const newShip = data.name
		const shipNames = player.game.retro ? Config.RETRO_SHIP_NAMES : Config.SHIP_NAMES
		if (shipNames.includes(newShip)) {
			player.switchUnit = newShip
		}
	})

	socket.on('action', (data) => {
		const player = socket.player
		if (!player || !player.game) {
			console.log('Action ERR: No game for player')
			return
		}
		const game = player.game
		if (game.serverUpdate < game.updatesUntilStart) {
			console.log('Action ERR: Game not started yet')
			return
		}
		if (player.actions.length > 10) {
			console.log('Action ERR: Too many actions')
			return
		}
		if (data.skill !== undefined) {
			if (data.level) {
				player.levelNext = data.skill
				return
			}
		}
		player.actions.push(data)
	})

	socket.on('chat', (data, callback) => {
		const response = {}
		const player = socket.player
		const inGame = !!player
		const chatObject = player || socket.queuer
		if (!chatObject) {
			response.error = `Not in queue`
		} else {
			const updateTime = getTimestamp() // player.game.serverUpdate
			if (updateTime <= chatObject.chatAt + 1) {
				response.error = 'Chatting too fast!'
			} else {
				chatObject.chatAt = updateTime
				data.at = updateTime
				if (!inGame) {
					data.from = socket.user.name
					io.to('queue').emit('msg', data)
				} else {
					data.id = socket.user.id
					if (data.all) {
						player.game.broadcast('msg', data)
					} else {
						player.game.teamBroadcast(player.team, 'msg', data)
					}
				}
			}
		}
		callback(response)
	})

	socket.on('updated', (data) => {
		const player = socket.player
		if (player) {
			player.serverUpdate = data.update
		}
	})
}
