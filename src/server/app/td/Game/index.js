const { TESTING } = require.main.require('../common/constants')

const { uid, displayTime } = require.main.require('./helpers/util')

const { TICK_DURATION, UPDATE_DURATION, VERSION } = require('./config')

const Player = require('./Player')

const ActivityModel = require.main.require('./models/activity')
const GameModel = require.main.require('./models/game')
const UserModel = require.main.require('./models/user')

//CONSTRUCTOR

const games = []

class Game {

	constructor (io, mode, playerCount) {
		this.id = uid()
		this.mode = mode
		this.players = []
		this.io = io.to(this.id)
		this.state = 'open'
		this.broadcastsPlaying = false
		this.serverUpdate = 0
		this.idleCount = 0
		this.singleplayer = playerCount <= 1
		this.updatesUntilStart = (TESTING && playerCount <= 1 ? 3 : 15) * 1000 / UPDATE_DURATION

		this.waves = 50 //SAMPLE
		this.wavesFinished = false
		this.waveNumber = 0
		this.waveCheck = 1
		this.sendWaveResult = true
		this.duration = 0
		this.startTime = null

		console.log(new Date().toLocaleTimeString(), this.id, 'TD created', this.mode)
		games.push(this)
	}

	//PRIVATE

	playerById (id) {
		for (const player of this.players) {
			if (player.user.id === id) {
				return player
			}
		}
		return null
	}

	playerIndexOf (id) {
		const players = this.players
		for (let idx = 0; idx < players.length; idx += 1) {
			const player = players[idx]
			if (player.user.id === id) {
				return idx
			}
		}
		return null
	}

	playerCount () {
		return this.players.length
	}

	hasJoinedPlayer () {
		for (const player of this.players) {
			if (player.isJoined) {
				return true
			}
		}
		return false
	}

	//STATE

	isStarted () {
		return this.state !== 'open'
	}

	isFinished () {
		return this.state === 'finished'
	}

	isPlaying () {
		return this.isStarted() && !this.isFinished()
	}

	//JOIN

	formattedPlayers () {
		const broadcastPlayers = []
		for (const player of this.players) {
			broadcastPlayers.push({
				id: player.user.id,
				name: player.user.name,
			})
		}
		return broadcastPlayers
	}

	async ready (socket) {
		if (!socket.player || this.isStarted()) {
			return
		}
		console.log(new Date().toLocaleTimeString(), this.id, 'TD started', this.players.length)
		socket.player.isReadyToStart = true
		for (const player of this.players) {
			if (!player.isReadyToStart) {
				return
			}
		}
		this.state = 'started'
		this.broadcastsPlaying = true
		this.waveNumber = 1
		this.startTime = new Date()
		this.broadcast('start game', {
			gid: this.id,
			players: this.formattedPlayers(),
			tickDuration: TICK_DURATION,
			updateDuration: UPDATE_DURATION,
			updatesUntilStart: this.updatesUntilStart,
			waves: this.waves,
			mode: this.mode,
		})
	}

	add (socket) {
		const user = socket.user
		const pid = user.id
		let data
		let player = this.playerById(pid)
		if (player) {
			player.isJoined = true
			socket.player = player
			this.broadcast('update player', { pid, joined: true })
			data = {
				gid: this.id,
				players: this.formattedPlayers(),
				tickDuration: TICK_DURATION,
				updateDuration: UPDATE_DURATION,
				updatesUntilStart: this.updatesUntilStart,
				// history: this.history, //TODO
			}
			console.log('Rejoin game', this.id, user.id)
		} else {
			if (this.isStarted()) {
				return socket.emit('joined game', { error: `Already playing ${this.id}` })
			}
			player = new Player(socket, user)
			this.players.push(player)
			data = { gid: this.id }
		}
		socket.game = this
		socket.player = player
		socket.join(this.id, () => {
			socket.emit('joined game', data)
		})
	}

	//LEAVE

	hasMultipleActivePlayers () {
		let remainingActivePlayerCount = 0
		for (const player of this.players) {
			if (player.isJoined && !player.finished && !player.didLose()) {
				if (remainingActivePlayerCount > 0) {
					return true
				}
				remainingActivePlayerCount += 1
			}
		}
		return false
	}

	checkFinished () {
		if (!this.hasMultipleActivePlayers()) {
			this.finish()
		}
	}

	hasValidParticipant () {
		for (const player of this.players) {
			if (player.waveNumber >= 2 || !player.didLose()) {
				return true
			}
		}
		return false
	}

	async finish () {
		if (this.isFinished()) {
			return console.log('ERR', this.id, 'Game already finished')
		}
		console.log(new Date().toLocaleTimeString(), this.id, 'TD finished')
		this.state = 'finished'
		if (this.singleplayer) {
			const player = this.players[0]
			if (player.waveNumber >= this.waves) {
				const user = player.user
				const score = this.duration
				const updated = await UserModel.highscore(user, 2, this.mode, score, false)
				if (updated) {
					ActivityModel.create(user, { action: 'highscore', body: `${this.mode} ${displayTime(score)}`, target_id: 2, target_type: 'topic' })
				}
			}
		} else { // Multiplayer
			if (this.hasValidParticipant()) {
				const data = this.players.map(p => [ p.user.id, p.lives, p.wavesWon ]).sort((a, b) => {
					const scoreA = -20 + a[1] + a[2] * 10
					const scoreB = -20 + b[1] + b[2] * 10
					return scoreB - scoreA
				})
				const playerIds = this.players.map(p => p.user.id)
				GameModel.create(this.id, 2, null, playerIds, this.startTime, this.duration, this.wavesFinished, data, VERSION)
				UserModel.playCount(playerIds)
			}
		}
	}

	destroy () {
		for (const player of this.players) {
			const socket = player.socket
			if (socket) {
				socket.leave(this.id)
				if (socket.game === this) {
					socket.game = null
					socket.player = null
				}
			}
		}

		for (let idx = games.length - 1; idx >= 0; idx -= 1) {
			if (this === games[idx]) {
				games.splice(idx, 1)
				return console.log(new Date().toLocaleTimeString(), this.id, 'TD removed')
			}
		}
		console.log('ERR unable to remove deleted game', this.id)
	}

	remove (socket) {
		const pid = socket.user.id
		const leaveIndex = this.playerIndexOf(pid)
		if (leaveIndex !== null) {
			if (this.isStarted()) {
				const player = this.players[leaveIndex]
				player.isJoined = false
			} else {
				this.players.splice(leaveIndex, 1)
				socket.game = null
				socket.player = null
			}

			if (!this.hasJoinedPlayer()) {
				this.destroy()
				return true
			}
			this.broadcast('update player', { pid, joined: false })
		}
	}

	broadcast (name, message) {
		this.io.emit(name, message)
	}

}

Game.all = games

Game.getList = function () {
	const result = []
	for (let idx = games.length - 1; idx >= 0; idx -= 1) {
		const game = games[idx]
		result.push({
			id: game.id,
			players: game.formattedPlayers(),
			state: game.state,
			update: game.serverUpdate,
		})
	}
	return result
}

module.exports = Game
