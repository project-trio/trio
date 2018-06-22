const Session = require.main.require('./models/session')
const User = require.main.require('./models/user')

const authError = (next, error) => {
	return next(new Error(error))
}

module.exports = {

	async auth (socket, next) {
		const query = socket.handshake.query
		const sessionToken = query.token
		if (sessionToken) {
			try {
				const session = await Session.update(sessionToken)
				if (!session) {
					return authError(next, 'signin session')
				}
				const user = await User.from('id', session.user_id)
				if (!user) {
					return authError(next, 'signin user')
				}
				socket.user = user
			} catch (error) {
				console.log(error)
				return authError(next, 'signin error')
			}
		} else {
			if (query.requireAuth) {
				return authError(next, 'signin')
			}
		}
		next()
	},

}
