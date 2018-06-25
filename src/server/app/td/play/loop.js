const { TESTING } = require.main.require('../common/constants')

const { UPDATE_DURATION } = require('./config')

const Game = require('./Game')

const startTime = process.hrtime()

const MAX_IDLE_UPDATES = TESTING ? 1000 : 1000

//LOCAL

let loopCount = 0

const loop = function () {
	for (const game of Game.all) {
		if (game.started) {
			let actionFound = false
			const actionData = []
			const currentUpdate = game.serverUpdate
			// const onSelectionScreen = currentUpdate <= game.updatesUntilStart
			// const gamePlayers = game.players
			// for (let pidx = 0; pidx < gamePlayers.length; pidx += 1) {
			// 	const player = gamePlayers[pidx]
			// }
			if (actionFound) {
				game.idleCount = 0
			} else if (game.idleCount > MAX_IDLE_UPDATES) {
				console.log(game.id, 'Game timed out due to inactivity')
				game.broadcast('closed')
				game.destroy()
				continue
			} else {
				game.idleCount += 1
			}
			game.broadcast('update', { update: currentUpdate, actions: actionData })
			game.serverUpdate = currentUpdate + 1
		}
	}

	const diff = process.hrtime(startTime)
	const msSinceStart = diff[0] * 1000 + diff[1] / 1000000
	loopCount += 1
	setTimeout(loop, UPDATE_DURATION * loopCount - msSinceStart)
}

loop()
