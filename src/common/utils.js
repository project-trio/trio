module.exports = {

	now () {
		return Math.round(Date.now() * 0.001)
	},

	randomItem (array) {
		const len = array.length
		return len ? array[Math.floor(Math.random() * len)] : null
	},

	randomRange (min, max) {
		return Math.random() * (max - min) + min
	},

}
