const { randomRange } = require.main.require('../common/utils')

const db = require.main.require('./helpers/db')
const live = require.main.require('./helpers/live')

const PUBLIC_FIELDS = 'id, name, ccid, md5, EXTRACT(EPOCH FROM updated_at) AS at, EXTRACT(EPOCH FROM created_at) AS created_at, admin'
const FIELDS = `${PUBLIC_FIELDS}, email, passcode, EXTRACT(EPOCH FROM passcode_at) AS passcode_at, passcode_attempts, email_status, email_change`

module.exports = {

	// Account

	create (email, name, ccid, md5) {
		const data = { email, name, ccid, md5 }
		return db.one(`INSERT INTO users($[this:name]) VALUES($[this:csv]) RETURNING ${PUBLIC_FIELDS}`, data)
	},

	from (paramType, paramValue, privateFields) {
		return db.oneOrNone(`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE ${paramType} = $1 RETURNING ${privateFields ? FIELDS : PUBLIC_FIELDS}`, paramValue)
	},

	all (ids, publicFields) {
		return db.manyOrNone(`SELECT ${publicFields ? PUBLIC_FIELDS : FIELDS} FROM users WHERE id IN ($1:csv)`, [ ids ])
	},

	// Play

	playCount (userIds) {
		return db.manyOrNone(`UPDATE users SET game_count = game_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id IN ($1)`, userIds)
	},

	async highscore (user, topicId, mode, score, increases) {
		const highscore = await db.oneOrNone(`INSERT INTO
			user_game_scores(user_id, topic_id, mode, score)
			VALUES($1, $2, $3, $4)
			ON CONFLICT ON CONSTRAINT user_game_scores_pkey DO UPDATE
				SET score = EXCLUDED.score, updated_at = EXCLUDED.updated_at
				WHERE EXCLUDED.score ${increases ? '>' : '<'} user_game_scores.score
			RETURNING score
		`, [ user.id, topicId, mode, score ])
		live.addHighscore(user, topicId, mode, highscore.score)
	},

	// Passcode

	makePasscode (user) {
		const passcode = randomRange(1000, 9999)
		return db.oneOrNone(`UPDATE users SET passcode = $2, passcode_at = CURRENT_TIMESTAMP, passcode_attempts = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING passcode`, [ user.id, passcode ])
	},

	incorrectPasscode (user, forceCancel) {
		return db.oneOrNone(`UPDATE users SET ${forceCancel ? 'passcode = NULL' : 'passcode_attempts = passcode_attempts + 1'}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [ user.id ])
	},

}
