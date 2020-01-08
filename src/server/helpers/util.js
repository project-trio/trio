const crypto = require('crypto')

module.exports = {

	uid () {
		const LENGTH = 6
		const BASE_58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
		const BASE_COUNT = BASE_58.length

		const randomValues = crypto.randomBytes(LENGTH)
		const result = new Array(LENGTH)
		for (let i = 0; i < LENGTH; i += 1) {
			result[i] = BASE_58[randomValues[i] % BASE_COUNT]
		}
		return result.join('')
	},

	displayTime (duration) {
		let seconds = Math.round(duration / 1000)
		let minutes
		if (seconds >= 60) {
			minutes = Math.floor(seconds / 60)
			seconds %= 60
			if (minutes < 10) {
				minutes = `0${minutes}`
			}
		} else {
			minutes = '00'
		}
		if (seconds < 10) {
			seconds = `0${seconds}`
		}
		return `${minutes}:${seconds}`
	},

	code () {
		return Math.floor(Math.random() * 900000) + 100000
	},

}
