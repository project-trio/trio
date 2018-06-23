const { randomRange } = require.main.require('../common/utils')

const db = require.main.require('./helpers/db')

const FIELDS = 'id, email, EXTRACT(EPOCH FROM updated_at) AS at, passcode, EXTRACT(EPOCH FROM passcode_at) AS passcode_at, passcode_attempts, email_status, email_change'
const PUBLIC_FIELDS = 'id, email, EXTRACT(EPOCH FROM updated_at) AS at'

module.exports = {

	create (email, _userType, _settings) {
		return db.one('INSERT INTO users(email) VALUES($1) RETURNING id', [ email ])
	},

	from (paramType, paramValue, publicFields) {
		return db.oneOrNone(`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE ${paramType} = $1 RETURNING ${publicFields ? PUBLIC_FIELDS : FIELDS}`, paramValue)
	},

	makePasscode (user) {
		const passcode = randomRange(100000, 999999)
		return db.oneOrNone(`UPDATE users SET passcode = $2, passcode_at = CURRENT_TIMESTAMP, passcode_attempts = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING passcode`, [ user.id, passcode ])
	},

	incorrectPasscode (user, forceCancel) {
		return db.oneOrNone(`UPDATE users SET ${forceCancel ? 'passcode = NULL' : 'passcode_attempts = passcode_attempts + 1'}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [ user.id ])
	},

	all (ids, publicFields) {
		return db.manyOrNone(`SELECT ${publicFields ? PUBLIC_FIELDS : FIELDS} FROM users WHERE id IN ($1:csv)`, [ ids ])
	},

}
