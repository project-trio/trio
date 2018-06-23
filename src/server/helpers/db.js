const pgp = require('pg-promise')({
	promiseLib: require('bluebird'),
})

const connectionURL = process.env.DATABASE_URL || 'postgres://localhost:5432/trio'

module.exports = pgp(connectionURL)
