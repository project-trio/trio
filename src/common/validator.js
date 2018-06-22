const VALID_EMAIL = /\S+@\S+\.\S+/

module.exports = {

	email (string) {
		if (!string || string.length < 6) {
			return 'Email too short'
		}
		if (!VALID_EMAIL.test(string)) {
			return 'Please enter a valid email'
		}
		return null
	},

	passcode (string) {
		if (isNaN(string)) {
			return 'Passcode must be numeric'
		}
		if (string.length < 6) {
			return 'Passcode too short, must be 6 digits'
		}
		if (string.length > 6) {
			return 'Passcode too long, must be 6 digits'
		}
		return null
	},

}
