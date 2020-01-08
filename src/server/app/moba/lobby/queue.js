const { randomItem } = require.main.require('../common/utils')

let io

const queuedPlayers = []

const removePlayer = function (player, index) {
	player.queueing = false
	if (index === undefined) {
		index = queuedPlayers.indexOf(player)
	}
	if (index === -1) {
		console.error('UNKNOWN QUEUE PLAYER', player)
		return false
	}
	queuedPlayers.splice(index, 1)
	return true
}

module.exports = {

	init (_io) {
		io = _io
	},

	add (player, data) {
		player.join('queue')
		if (!player.queueing) {
			player.queueing = true
			queuedPlayers.push(player)
		}
		this.updatePlayer(player, data)
	},

	update () {
		const queuedCount = queuedPlayers.length
		const maxCountSize = 10
		const queuedSizes = new Array(maxCountSize).fill(0).map((_, idx) => { return (idx + 1) * 2 })
		const readiedCounts = [...queuedSizes]
		for (const player of queuedPlayers) {
			for (let size = maxCountSize; size >= player.queueMin; size -= 1) {
				queuedSizes[size - 1] -= 1
				if (player.queueReady) {
					readiedCounts[size - 1] -= 1
				}
			}
		}
		for (let size = readiedCounts.length; size >= 1; size -= 1) {
			if (readiedCounts[size - 1] <= 0) {
				const Game = require.main.require('./game/game')
				const map = size <= 2 ? 'tiny' : size <= 3 ? 'small' : size <= 6 ? 'standard' : 'large'
				const game = new Game(io, 'pvp', size, map, true)

				const requestedMaps = []
				for (let idx = 0; idx < queuedCount; idx += 1) {
					const player = queuedPlayers[idx]
					if (player.queueReady && player.queueMin <= size) {
						if (removePlayer(player, idx)) {
							idx -= 1
						}
						if (player.queueMap) {
							requestedMaps.push(player.queueMap)
						}
						const joinData = game.add(player)
						if (joinData.error) {
							player.emit('queue', { error: joinData.error })
						} else {
							player.emit('queue', { gid: game.id })
						}
						if (game.checkFull()) {
							break
						}
					}
				}
				if (requestedMaps.length) {
					game.setMap(randomItem(requestedMaps))
				}

				return this.update()
			}
		}

		io.to('queue').emit('queue', {
			players: queuedCount,
			available: queuedSizes,
		})
	},

	updatePlayer (player, data) {
		player.updateQueue(data)
		this.update()
	},

	remove (player) {
		player.leave('queue')
		if (player.queueing) {
			removePlayer(player)
			this.update()
		}
	},

}
