const request = require('request')

const CommonValidator = require.main.require('../common/validator')
const { now } = require.main.require('../common/utils')

const live = require.main.require('./helpers/live')
const mailer = require.main.require('./helpers/mailer')

const Activity = require.main.require('./models/activity')
const User = require.main.require('./models/user')
const Session = require.main.require('./models/session')

async function makePasscode (user, callback) {
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
	live.connectUser(socket, user)
	callback({ token: session.id })
}

async function emailRegister (socket, data, callback) {
	let { email, name, ccid, md5 } = data
	email = email.trim()
	const emailError = CommonValidator.email(email)
	if (emailError) {
		return callback({ error: emailError })
	}
	if (!name) {
		return callback({ register: true })
	}
	name = name.trim()
	const nameError = CommonValidator.name(name.split(' '))
	if (nameError) {
		return callback({ error: nameError })
	}
	let user
	try {
		user = await User.create(email, name, ccid, md5)
		Activity.create(user, { action: 'create' })
	} catch (error) {
		return console.log(error)
	}
	await makeSession(socket, user, callback)
}

async function emailSignin (socket, user, email, callback) {
	if (email && user.email_status) {
		return callback({ error: 'Cannot deliver to this email address', emailStatus: user.email_status, cancel: false })
	}
	await makePasscode(user, callback)
}

async function passcodeSignin (socket, user, data, callback) {
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
		const passcode = data.passcode
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

//PUBLIC

module.exports = (socket) => {
	socket.on('signin', async (data, callback) => {
		const email = data.email.trim()
		if (!email) {
			return callback({ error: 'Please enter your email' })
		}
		const user = await User.from('email', email, true)
		if (!data.passcode) {
			if (user) {
				emailSignin(socket, user, email, callback)
			} else {
				emailRegister(socket, data, callback)
			}
		} else {
			passcodeSignin(socket, user, data, callback)
		}
	})

	socket.on('check name', async (name, callback) => {
		if (!name) {
			return
		}
		const existingUser = await User.from('name', name, false)
		if (existingUser) {
			return callback({ error: 'User already exists', name })
		}
		request(`http://old.casualcollective.com/load/profiles/${name}`, (error, response, body) => {
			if (error) {
				return callback({ error: 'Could not check name', name })
			}
			if (body.length < 300) {
				return callback({ name })
			}
			const contentStartIndex = body.indexOf('"h"') - 1
			let json = JSON.parse(`${body.substring(0, contentStartIndex)}}`)
			json = json.a
			if (!json) {
				console.log(body)
				return callback({ error: 'User data unavailable', name })
			}
			json = json.e
			if (!json) {
				return callback({ error: 'User data unavailable', name })
			}
			const ccid = parseInt(json.split('profile.')[1].split(`'`)[0], 10)
			callback({ name, ccid })
		})
	})
}
