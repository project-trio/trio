const { UPDATE_DURATION } = require('./config')

const Game = require('./index.js')

const startTime = process.hrtime()

//LOCAL

let loopCount = 0

const loop = function () {
	for (const game of Game.all) {
		if (!game.playing) {
			continue
		}
		const states = []
		const currentUpdate = game.serverUpdate
		const gamePlayers = game.players
		let bestWaveTime = null
		for (let pidx = 0; pidx < gamePlayers.length; pidx += 1) {
			const player = gamePlayers[pidx]
			if (player.waveNumber === game.waveCheck) {
				if (!bestWaveTime || player.waveAt < bestWaveTime) {
					bestWaveTime = player.waveAt
				}
			}

			if (player.towers.length) {
				player.send.towers = player.towers
				player.towers = []
			}
			states[pidx] = player.send
			player.send = {}
		}
		let wave = null
		const winners = []
		if (bestWaveTime) {
			const sendResult = !game.sendWaveResult
			game.sendWaveResult = sendResult
			if (sendResult) {
				for (let pidx = 0; pidx < gamePlayers.length; pidx += 1) {
					const player = gamePlayers[pidx]
					if (player.waveNumber === game.waveCheck && player.waveAt === bestWaveTime) {
						player.wavesWon += 1
						winners.push(pidx)
					}
				}
				wave = game.waveCheck
				game.waveCheck = game.waveNumber
				if (game.waveCheck > game.waves) {
					game.wavesFinished = true
					game.finish()
				}
			} else {
				wave = game.waveNumber
				game.waveNumber += 1
				game.duration += bestWaveTime + UPDATE_DURATION
			}
		}

		const actions = [ wave, winners.length ? winners : null ]
		const finished = game.finished
		if (finished) {
			game.playing = false
		}
		game.broadcast('server update', { update: currentUpdate, actions, states, finished: finished ? game.duration : undefined })
		game.serverUpdate = currentUpdate + 1
	}

	const diff = process.hrtime(startTime)
	const msSinceStart = diff[0] * 1000 + diff[1] / 1000000
	loopCount += 1
	setTimeout(loop, UPDATE_DURATION * loopCount - msSinceStart)
}

module.exports = loop
