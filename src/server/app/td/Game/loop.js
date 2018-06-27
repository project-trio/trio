const { UPDATE_DURATION } = require('./config')

const Game = require('./index.js')

const startTime = process.hrtime()

//LOCAL

let loopCount = 0

const loop = function () {
	for (const game of Game.all) {
		if (game.started) {
			const currentUpdate = game.serverUpdate
			const gamePlayers = game.players
			let bestWaveTime = null
			for (let pidx = 0; pidx < gamePlayers.length; pidx += 1) {
				const player = gamePlayers[pidx]
				if (player.wave === game.wave) {
					if (!bestWaveTime || player.waveComplete < bestWaveTime) {
						bestWaveTime = player.waveComplete
					}
				}
			}
			const winners = []
			if (bestWaveTime) {
				for (let pidx = 0; pidx < gamePlayers.length; pidx += 1) {
					const player = gamePlayers[pidx]
					if (player.wave === game.wave && player.waveComplete === bestWaveTime) {
						winners.push(pidx)
					}
				}
				// console.log('Wave', game.wave, winners, currentUpdate - game.waveUpdate)
				game.wave += 1
				game.waveUpdate = currentUpdate
			}
			game.broadcast('server update', { update: currentUpdate, actions: winners })
			game.serverUpdate = currentUpdate + 1
		}
	}

	const diff = process.hrtime(startTime)
	const msSinceStart = diff[0] * 1000 + diff[1] / 1000000
	loopCount += 1
	setTimeout(loop, UPDATE_DURATION * loopCount - msSinceStart)
}

module.exports = loop