const { randomItem } = require.main.require('../common/utils')

const MobaGame = require('../Game')

let io

const queuers = []

class Queuer {
	constructor (socket, data) {
		this.socket = socket
		this.update(data)
	}

	update (data) {
		this.queueReady = data.ready
		this.queueMin = data.size
		this.queueMap = data.map
	}

	remove (index) {
		this.socket.queuer = null
		if (index === undefined) {
			index = queuers.indexOf(this)
		}
		if (index === -1) {
			console.error('UNKNOWN QUEUE PLAYER', this)
			return false
		}
		queuers.splice(index, 1)
		return true
	}
}

module.exports = {

	init (_io) {
		io = _io
	},

	add (socket, data) {
		socket.join('queue')
		const queuer = socket.queuer
		if (queuer) {
			queuer.update(data)
		} else {
			const queuer = new Queuer(socket, data)
			socket.queuer = queuer
			queuers.push(queuer)
		}
		this.update()
	},

	update () {
		const queuedCount = queuers.length
		const maxCountSize = 10
		const queuedSizes = new Array(maxCountSize).fill(0).map((_, idx) => { return (idx + 1) * 2 })
		const readiedCounts = [...queuedSizes]
		for (const queuer of queuers) {
			for (let size = maxCountSize; size >= queuer.queueMin; size -= 1) {
				queuedSizes[size - 1] -= 1
				if (queuer.queueReady) {
					readiedCounts[size - 1] -= 1
				}
			}
		}
		for (let size = readiedCounts.length; size >= 1; size -= 1) {
			if (readiedCounts[size - 1] <= 0) {
				const map = size <= 2 ? 'tiny' : size <= 3 ? 'small' : size <= 6 ? 'standard' : 'large'
				const game = new MobaGame(io, 'pvp', size, map, true)

				const requestedMaps = []
				for (let idx = 0; idx < queuedCount; idx += 1) {
					const queuer = queuers[idx]
					if (queuer.queueReady && queuer.queueMin <= size) {
						if (queuer.remove(idx)) {
							idx -= 1
						}
						if (queuer.queueMap) {
							requestedMaps.push(queuer.queueMap)
						}
						const socket = queuer.socket
						const gameData = game.addSocket(socket)
						if (gameData.error) {
							socket.emit('joined game', { error: gameData.error })
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

	updateSocket (socket, data) {
		const queuer = socket.queuer
		if (!queuer) {
			return
		}
		queuer.update(data)
		this.update()
	},

	removeSocket (socket) {
		socket.leave('queue')
		const queuer = socket.queuer
		if (queuer) {
			queuer.remove(undefined)
			this.update()
		}
	},

	broadcastWith (io, withPlayers, withGames) {
		const data = {}
		if (withPlayers) {
			data.online = 0 //TODO
		}
		if (withGames) {
			data.games = MobaGame.getList()
		}
		io.to('lobby').emit('lobby', data)
	},

}
