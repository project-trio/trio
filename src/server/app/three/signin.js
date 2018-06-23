const CommonValidator = require.main.require('../common/validator')
const { now } = require.main.require('../common/utils')

const mailer = require.main.require('./helpers/mailer')

const Activity = require.main.require('./models/activity')
const User = require.main.require('./models/user')
const Session = require.main.require('./models/session')

async function makePasscode (callback, user) {
	const email = user.email
	const passcodeAt = user.passcode_at
	if (passcodeAt && now() - passcodeAt < 60) {
		return callback({ userID: user.id, skipped: true })
	}
	const passcodeCreation = await User.makePasscode(user)
	mailer.passcode(email, passcodeCreation.passcode, () => {
		callback({ userID: user.id })
	}, _error => {
		callback({ error: 'Invalid email', cancel: true })
	})
}

async function makeSession (socket, user, callback) {
	const session = await Session.create(user)
	socket.user = user
	callback({ token: session.id })
}

//PUBLIC

module.exports = (socket) => {
	socket.on('signin', async ({ email, passcode }, callback) => {
		const user = await User.from('email', email)
		if (!passcode) {
			emailSignin(socket, user, email, callback)
		} else {
			passcodeSignin(socket, user, email, passcode, callback)
		}
	})
}

const emailSignin = async (socket, user, email, callback) => {
	if (!user) {
		const validationError = CommonValidator.email(email)
		if (validationError) {
			return callback({ error: validationError, cancel: undefined })
		}
		try {
			user = await User.create(email)
			Activity.create(user, { action: 'create' })
		} catch (error) {
			return console.log(error)
		}
		await makeSession(socket, user, callback)
	}

	if (email && user.email_status) {
		return callback({ error: 'Cannot deliver to this email address', emailStatus: user.email_status, cancel: false })
	}
	await makePasscode(callback, user)
}

const passcodeSignin = async (socket, user, email, passcode, callback) => {
	if (!user) {
		return callback({ error: 'Invalid email for passcode', cancel: true })
	}
	let error, erasePasscode = false
	const passcodeAt = user.passcode_at
	if (!passcodeAt || now() > passcodeAt + 4 * 60 * 60) {
		error = 'Passcode expired'
		erasePasscode = true
	} else if (user.passcode_attempts >= 5) {
		error = 'Too many incorrect passcode attempts'
		erasePasscode = true
	} else {
		const validationError = CommonValidator.passcode(passcode)
		if (validationError) {
			error = validationError
		} else if (parseInt(passcode, 10) !== user.passcode) {
			error = 'Incorrect passcode'
		}
	}
	if (error) {
		await User.incorrectPasscode(user, erasePasscode)
		return callback({ error, cancel: erasePasscode })
	}
	await makeSession(socket, user, callback)
}
