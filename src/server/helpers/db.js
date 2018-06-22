const pgp = require('pg-promise')({
	promiseLib: require('bluebird'),
})

const connectionURL = process.env.DATABASE_URL || 'postgres://localhost:5432/three'

module.exports = pgp(connectionURL)
