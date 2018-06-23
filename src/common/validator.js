const REGEX_NAME_CHARACTERS = /[^a-zA-Z0-9]/
const REGEX_DIGITS = /^\d+$/
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

	name (split) { //TODO WebPack error prevents splitting inside module.exports
		if (split.length > 2) {
			return 'Too many spaces'
		}
		const joined = split.join('')
		if (joined.length < 3) {
			return 'Name too short'
		}
		if (joined.length > 16) { //20
			return 'Name too long'
		}
		if (REGEX_NAME_CHARACTERS.test(joined)) {
			return 'Only basic letters allowed'
		}
		if (REGEX_DIGITS.test(joined)) {
			return 'Name must contain letters'
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
