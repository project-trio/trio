const CommonConsts = require.main.require('../common/constants')

const sendgridMail = require('@sendgrid/mail')

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)
sendgridMail.setSubstitutionWrappers('{{', '}}')

const sendSendgrid = (message, multi, templateId, onSuccess, onError) => {
	if (!message.substitutions) {
		message.substitutions = {}
	}
	message.from = 'triocommunity@gmail.com'
	message.substitutions.base_url = CommonConsts.BASE_URL
	message.templateId = templateId
	sendgridMail.send(message, multi)
	.then(onSuccess)
	.catch(error => {
		console.log(error.toString(), message)
		if (onError) {
			onError()
		}
	})
}

module.exports = {

	passcode (email, passcode, onSuccess, onError) {
		const message = {
			to: email,
			substitutions: {
				email,
				passcode,
			},
		}
		return sendSendgrid(message, false, process.env.SENDGRID_PASSCODE_TEMPLATE, onSuccess, onError)
	},

}
