const crypto = require('crypto')

module.exports = {

	uid () {
		const LENGTH = 6
		const BASE_58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
		const BASE_COUNT = BASE_58.length

		const randomValues = crypto.randomBytes(LENGTH)
		const result = new Array(LENGTH)
		for (let i = 0; i < LENGTH; i++) {
			result[i] = BASE_58[randomValues[i] % BASE_COUNT]
		}
		return result.join('')
	},

}
