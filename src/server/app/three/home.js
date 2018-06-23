const global = require.main.require('./helpers/global')
const middleware = require.main.require('./helpers/middleware')

module.exports = (socket) => {
	middleware.page(socket, 'home', (data, callback) => {
		callback({ activities: global.activities(), users: global.users() })
	})
}
