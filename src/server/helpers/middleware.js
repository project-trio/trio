const live = require.main.require('./helpers/live')

const Session = require.main.require('./models/session')
const User = require.main.require('./models/user')

const authError = (next, redirect, error) => {
	return next(new Error(redirect ? process.env.BASE_URL : error))
}

const auth = async (socket, next) => {
	const query = socket.handshake.query
	const sessionToken = query.token
	const namespace = socket.nsp.name
	const isGame = namespace !== '/trio'
	const game = isGame ? namespace : null
	if (sessionToken && sessionToken.length === 36) {
		try {
			const session = await Session.update(sessionToken)
			if (!session) {
				return authError(next, isGame, 'signin session')
			}
			const user = await User.from('id', session.user_id, false)
			if (!user) {
				return authError(next, isGame, 'signin user')
			}
			if (!live.connectUser(socket, user, game)) {
				return authError(next, false, 'Already in game')
			}
		} catch (error) {
			console.log(error)
			return authError(next, isGame, 'signin error')
		}
	} else {
		if (game) {
			return authError(next, isGame, 'signin')
		}
	}
	next()
}

module.exports = {

	namespace (io, name, callback) {
		const namespace = io.of(`/${name}`)
		namespace.use(auth)
		namespace.on('connection', (socket) => {
			callback(socket)

			socket.on('disconnect', () => {
				const player = socket.player
				if (player) {
					player.game.remove(socket)
				}
				live.disconnect(socket)
			})
		})
		return namespace
	},

	page (socket, page, pageCallback) {
		socket.on(`join ${page}`, (data, callback) => {
			if (!socket.user) {
				return callback({ error: 'Authentication required' })
			}
			const oldPage = socket.page
			if (page !== oldPage) {
				if (oldPage) {
					socket.leave(oldPage)
				}
				socket.join(page)
				socket.page = 'home'
			}
			pageCallback(data, callback)
		})
	},

}
