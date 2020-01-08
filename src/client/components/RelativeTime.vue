<template>
<time :datetime="new Date(at * 1000)">{{ ago }}</time>
</template>

<script>
const secondsInMinute = 60
let timeSteps
{
	const secondsInHour = 60 * secondsInMinute
	const secondsInDay = 24 * secondsInHour
	const secondsInMonth = 30.5 * secondsInDay
	const secondsInYear = 365.25 * secondsInDay
	timeSteps = [ [secondsInYear, 'y'], [secondsInMonth, 'mo'], [secondsInDay, 'd'], [secondsInHour, 'h'], [secondsInMinute, 'm'] ]
}

export default {
	props: {
		at: Number,
	},

	computed: {
		ago () {
			const results = []
			let remainingTime = this.$store.state.local.timeMinutely - this.at
			if (remainingTime < secondsInMinute) {
				return 'just now'
			}
			for (const [ stepSeconds, stepLabel ] of timeSteps) {
				const value = Math.floor(remainingTime / stepSeconds)
				if (value >= 1) {
					results.push(`${value}${stepLabel}`)
					if (results.length >= 2) {
						break
					}
					remainingTime %= stepSeconds
				}
			}
			return `${results.join(' ')} ago`
		},
	},
}
</script>
