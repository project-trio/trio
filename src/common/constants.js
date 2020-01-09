module.exports = {

	TESTING: process.env.NODE_ENV !== 'production',

	REACTION_EMOJI: [
		[ '🤔', '😰', '😡' ],
		[ '❤️', '👍', '😂' ],
		[ '🔥', '👀', '🏳️' ],
	],

	TOPIC_DATA: {
		Moba: {
			id: 1,
			name: 'Moba',
			subdomain: 'moba',
		},
		TD: {
			id: 2,
			name: 'TD',
			subdomain: 'ttd',
		},
	},

}
