const { randomRange } = require.main.require('../common/utils')

const db = require.main.require('./helpers/db')

module.exports = {

	create (email, _userType, _settings) {
		return db.one('INSERT INTO users(email) VALUES($1) RETURNING id', [ email ])
	},

	from (paramType, paramValue) {
		return db.oneOrNone(`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE ${paramType} = $1 RETURNING id, email, passcode, EXTRACT(EPOCH FROM passcode_at) AS passcode_at, passcode_attempts, email_status, email_change`, paramValue)
	},

	makePasscode (user) {
		const passcode = randomRange(100000, 999999)
		return db.oneOrNone(`UPDATE users SET passcode = $2, passcode_at = CURRENT_TIMESTAMP, passcode_attempts = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING passcode`, [ user.id, passcode ])
	},

	incorrectPasscode (user, forceCancel) {
		return db.oneOrNone(`UPDATE users SET ${forceCancel ? 'passcode = NULL' : 'passcode_attempts = passcode_attempts + 1'}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [ user.id ])
	},

}
