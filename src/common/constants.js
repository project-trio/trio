const TESTING = process.env.NODE_ENV !== 'production'

module.exports = {
	PORT: 8031,
	TESTING,
	BASE_URL: `${TESTING ? 'http://localhost:8030' : 'https://trio.suzu.online'}`,
}
