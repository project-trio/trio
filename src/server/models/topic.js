const db = require.main.require('./helpers/db')

module.exports = {

	latest () {
		return db.manyOrNone(`SELECT id, name FROM topics ORDER BY updated_at DESC LIMIT 1000`)
	},

}
