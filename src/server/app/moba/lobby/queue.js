const { now, randomItem } = require.main.require('../common/utils')

const MobaGame = require('../Game')

let io

const queuers = []

class Queuer {
	constructor (socket, data) {
		this.socket = socket
		this.update(data)
	}

	update (data) {
		this.isReadyPressed = data.ready
		this.queueMin = data.size
		this.queueMap = data.map
		this.chatAt = 0
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

let queueExpiredTimeout = null, queuePendingForSize = null, queuePopAt = null

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

	popQueueAt (size) {
		const map = size <= 2 ? 'tiny' : size <= 3 ? 'small' : size <= 6 ? 'standard' : 'large'
		const game = new MobaGame(io, 'pvp', size, map, true)
		const requestedMaps = []
		for (let idx = 0; idx < queuers.length; idx += 1) {
			const queuer = queuers[idx]
			if (queuer.isReadyPressed && queuer.queueMin <= size) {
				if (queuer.remove(idx)) {
					idx -= 1
				}
				if (queuer.queueMap) {
					requestedMaps.push(queuer.queueMap)
				}
				const socket = queuer.socket
				const gameData = game.addSocket(socket)
				if (gameData.error) {
					console.log('Unable to join queued game', gameData.error)
					socket.emit('joined game', { error: gameData.error })
				}
				if (game.checkFull()) {
					break
				}
			}
		}
		if (!game.checkFull()) {
			console.log('ERR: Insufficient players for queued game', size, queuers)
			return game.destroy()
		}
		if (requestedMaps.length) {
			game.setMap(randomItem(requestedMaps))
		}
		return this.update()

	},

	update () {
		const maxCountSize = 10
		const queuersMissingForSizes = new Array(maxCountSize).fill(0).map((_, idx) => { return (idx + 1) * 2 })
		const readiedMissingForSizes = [...queuersMissingForSizes]
		for (const queuer of queuers) {
			for (let size = maxCountSize; size >= queuer.queueMin; size -= 1) {
				const sizeIndex = size - 1
				queuersMissingForSizes[sizeIndex] -= 1
				if (queuer.isReadyPressed) {
					const missingCountForSize = readiedMissingForSizes[sizeIndex] - 1
					if (missingCountForSize === 0) {
						return this.popQueueAt(size)
					}
					readiedMissingForSizes[sizeIndex] = missingCountForSize
				}
			}
		}
		let foundAvailableSize = null
		for (let size = maxCountSize; size >= 1; size -= 1) {
			const missingCountForSize = queuersMissingForSizes[size - 1]
			if (missingCountForSize <= 0) {
				foundAvailableSize = size
				if (size === queuePendingForSize) {
					console.log('Queue already pending for ', size)
					break
				}
				queuePendingForSize = size
				const pendingDuration = 20
				queuePopAt = now() + pendingDuration
				queueExpiredTimeout = setTimeout(() => {
					queuePendingForSize = null
					for (let idx = queuers.length - 1; idx >= 0; idx -= 1) {
						const queuer = queuers[idx]
						if (queuer.queueMin <= size) {
							const wasReady = queuer.isReadyPressed
							if (!wasReady) {
								queuer.remove(idx)
							}
							queuer.socket.emit('queue expired', { error: wasReady ? 'A player did not confirm the ready check. They have been removed from the queue.' : 'You failed to confirm the ready check and have been removed from the queue.', backToLobby: !wasReady })
						}
					}
					this.update()
				}, pendingDuration * 1000)
			}
		}
		if (foundAvailableSize !== queuePendingForSize) {
			clearTimeout(queueExpiredTimeout)
			queuePendingForSize = null
		}
		io.to('queue').emit('queue', {
			players: queuers.length,
			available: queuersMissingForSizes,
			popAt: queuePopAt,
			popSize: queuePendingForSize,
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
