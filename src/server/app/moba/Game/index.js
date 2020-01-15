const { TESTING, UPDATE_DURATION } = require.main.require('../common/constants')

const Game = require.main.require('./app/Game')

const MobaPlayer = require('./Player')

//CONSTRUCTOR

const games = []

class MobaGame extends Game {

	constructor (io, mode, size, map, autoStart) {
		super(io, mode)
		this.botMode = mode === 'bots'
		this.tutorialMode = mode === 'tutorial'
		this.size = size
		this.hostID = null
		this.autoStart = autoStart
		this.updatesUntilStart = this.tutorialMode ? 0 : ((TESTING ? 5 : 20) * 1000 / UPDATE_DURATION)

		if (this.botMode) {
			const firstTeam = 1 //SAMPLE
			for (let teamIndex = 0; teamIndex < size; teamIndex += 1) {
				new MobaPlayer(null, this, firstTeam)
			}
			if (TESTING || size >= 10) {
				const secondTeam = 1 - firstTeam
				for (let teamIndex = 0; teamIndex < size - 1; teamIndex += 1) {
					new MobaPlayer(null, this, secondTeam)
				}
			}
		}

		this.setMap(map)
		console.log(this.id, 'Created game', mode, size, map)
		games.push(this)
	}

	checkFull () {
		const playerCount = this.playerCount()
		return playerCount > 0 && playerCount >= this.size * (this.botMode ? 1 : 2)
	}

	//STATE

	setMap (map) {
		this.map = map
		this.retro = map === 'retro'
		for (const player of this.players) {
			player.setRetro(this.retro)
		}
	}

	teamCounts () {
		const results = [ 0, 0 ]
		for (const player of this.players) {
			results[player.team] += 1
		}
		return results
	}

	validNumberOfPlayers () {
		const playerCount = this.players.length
		if (playerCount) {
			if (this.botMode || this.tutorialMode) {
				return true
			}
			if (playerCount % 2 === 0) {
				// const minSize = Math.ceil(this.size / 2) //TODO later
				return true
			}
		}
		return false
	}

	allPlayersReady () {
		for (const player of this.players) {
			if (!player.joinCompleted) {
				return false
			}
		}
		return true
	}

	canStart () {
		return this.validNumberOfPlayers() && this.allPlayersReady()
	}

	//JOIN

	formattedPlayers () {
		const broadcastPlayers = []
		for (const player of this.players) {
			broadcastPlayers.push(player.data())
		}
		return broadcastPlayers
	}

	addSocket (socket) {
		const pid = socket.user.id
		let player = this.playerById(pid)
		if (player) {
			this.broadcast('update player', { pid, joined: true })
		} else {
			if (this.isStarted()) {
				return { error: `Unable to join: ${this.state} game` }
			}
			if (this.checkFull()) {
				return { error: 'Game full' }
			}
			const teamCounts = this.teamCounts()
			const team = teamCounts[0] <= teamCounts[1] ? 0 : 1
			player = new MobaPlayer(socket, this, team)
			if (!this.hostID) {
				this.hostID = pid
			}
			player.setRetro(this.retro, this.tutorialMode)
			if (!this.autoStart) {
				this.broadcast('players', { ready: this.canStart(), players: this.formattedPlayers() })
			}
		}
		socket.player = player
		socket.join(this.id, (error) => {
			let data
			if (this.destroyed) {
				error = 'Game closed'
			}
			if (error) {
				data = { error: error }
				this.remove(socket)
			} else {
				data = { gid: this.id, hostID: this.hostID, mode: this.mode, size: this.size, map: this.map, ready: this.canStart(), players: this.formattedPlayers() }
				if (socket.player && socket.player.game.id === this.id) {
					socket.player.joinCompleted = true
				}
			}
			socket.emit('joined game', data)
		})
		return { gid: this.id }
	}

	destroy () {
		super.destroy()

		for (let idx = games.length - 1; idx >= 0; idx -= 1) {
			if (this === games[idx]) {
				games.splice(idx, 1)
				return
			}
		}
		console.log('ERR unable to remove deleted game', this.id)
	}

	remove (socket) {
		if (super.remove(socket)) {
			return true
		}

		if (!this.isStarted()) {
			this.broadcast('players', { ready: this.canStart(), players: this.formattedPlayers() })
			return true
		}
	}

	//METHODS

	start () {
		const startData = {
			gid: this.id,
			mode: this.mode,
			size: this.size,
			map: this.map,
			players: this.formattedPlayers(),
			updatesUntilStart: this.updatesUntilStart,
		}
		this.broadcast('started game', startData)
		this.state = Game.STATE_STARTED
		console.log(this.id, 'Started')
		return startData
	}

	teamBroadcast (team, name, message) {
		for (const player of this.players) {
			if (player.team === team) {
				player.emit(name, message)
			}
		}
	}

}

MobaGame.all = games

MobaGame.getList = function () {
	const result = []
	for (let idx = games.length - 1; idx >= 0; idx -= 1) {
		const game = games[idx]
		result.push({
			id: game.id,
			players: game.formattedPlayers(),
			state: game.state,
			mode: game.mode,
			size: game.size,
			map: game.map,
			update: game.serverUpdate,
		})
	}
	return result
}

MobaGame.findPlayerForUserID = function (userID) {
	for (const game of games) {
		const player = game.playerById(userID)
		if (player) {
			return player
		}
	}
	return null
}

module.exports = MobaGame
