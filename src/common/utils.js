module.exports = {

	getTimestamp () {
		return Math.round(Date.now() / 1000)
	},

	randomItem (array) {
		const len = array.length
		return len ? array[Math.floor(Math.random() * len)] : null
	},

	randomRange (min, max) {
		return Math.random() * (max - min) + min
	},

}
