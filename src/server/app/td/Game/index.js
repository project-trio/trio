const { TESTING } = require('@/common/constants')
const { TICK_DURATION, UPDATE_DURATION, VERSION } = require('../config')

const { displayTime } = require('@/server/helpers/util')

const Game = require('@/server/app/Game')

const TDPlayer = require('./Player')

const ActivityModel = require('@/server/models/activity')
const GameModel = require('@/server/models/game')
const UserModel = require('@/server/models/user')

//CONSTRUCTOR

const games = []

class TDGame extends Game {

	constructor (io, mode, size) {
		super(io, mode)
		this.broadcastsPlaying = false
		this.idleCount = 0
		this.singleplayer = size <= 1
		this.updatesUntilStart = (TESTING && size <= 1 ? 4 : 15) * 1000 / UPDATE_DURATION

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
		this.state = Game.STATE_STARTED
		this.broadcastsPlaying = true
		this.waveNumber = 1
		this.startTime = new Date()
		this.broadcast('started game', {
			gid: this.id,
			players: this.formattedPlayers(),
			tickDuration: TICK_DURATION,
			updateDuration: UPDATE_DURATION,
			updatesUntilStart: this.updatesUntilStart,
			waves: this.waves,
			mode: this.mode,
		})
	}

	addSocket (socket) {
		const user = socket.user
		const pid = user.id
		let player = this.playerById(pid)
		const isOldPlayer = !!player
		if (!player) {
			if (this.isStarted()) {
				return socket.emit('joined game', { error: `Already playing ${this.id}` })
			}
			player = new TDPlayer(socket, this)
		}
		socket.player = player
		socket.join(this.id, () => {
			player.joinCompleted = true
			if (isOldPlayer) {
				this.broadcast('update player', { pid, joined: true })
			}
			socket.emit('joined game', { gid: this.id })
		})
	}

	//LEAVE

	hasMultipleActivePlayers () {
		let remainingActivePlayerCount = 0
		for (const player of this.players) {
			if (player.joinCompleted && !player.finished && !player.didLose()) {
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
		this.state = Game.STATE_FINISHED
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
		super.destroy()

		for (let idx = games.length - 1; idx >= 0; idx -= 1) {
			if (this === games[idx]) {
				games.splice(idx, 1)
				return console.log(new Date().toLocaleTimeString(), this.id, 'TD removed')
			}
		}
		console.log('ERR unable to remove deleted game', this.id)
	}

}

TDGame.all = games

TDGame.getList = function () {
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

module.exports = TDGame
