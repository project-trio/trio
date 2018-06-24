const TESTING = process.env.NODE_ENV !== 'production'

module.exports = {
	TESTING,
	BASE_URL: `${TESTING ? 'http://localhost:8030' : 'https://trio.suzu.online'}`,
}
