const global = require.main.require('./helpers/global')

const Session = require.main.require('./models/session')
const User = require.main.require('./models/user')

const authError = (next, error) => {
	return next(new Error(error))
}

const auth = async (socket, next) => {
	const query = socket.handshake.query
	const sessionToken = query.token
	const namespace = socket.nsp.name
	const game = namespace !== '/trio' ? namespace : null
	if (sessionToken) {
		socket.isGame = true
		try {
			const session = await Session.update(sessionToken)
			if (!session) {
				return authError(next, 'signin session')
			}
			const user = await User.from('id', session.user_id)
			if (!user) {
				return authError(next, 'signin user')
			}
			if (!global.connectUser(socket, user, game)) {
				return authError(next, 'Already in game')
			}
		} catch (error) {
			console.log(error)
			return authError(next, 'signin error')
		}
	} else {
		if (game) {
			return authError(next, 'signin')
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
				const user = socket.user
				if (user) {
					if (user.game === socket.nsp.name) {
						user.game = null
					}
					global.disconnect(socket)
				}
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
