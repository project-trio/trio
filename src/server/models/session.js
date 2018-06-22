const db = require.main.require('./helpers/db')

module.exports = {

	create (user) {
		return db.one('INSERT INTO user_sessions(user_id) VALUES($1) RETURNING id', user.id)
	},

	update (sessionToken) {
		return db.oneOrNone(`UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING user_id`, sessionToken)
	},

	list (user) {
		return db.manyOrNone(`SELECT id FROM user_sessions WHERE user_id = $1 ORDER BY updated_at DESC`, user.id)
	},

	delete (sessionID) {
		return db.oneOrNone(`DELETE FROM user_sessions WHERE id = $1`, sessionID)
	},

}
