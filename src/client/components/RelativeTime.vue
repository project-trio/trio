<template>
<time :datetime="new Date(at)">
	{{ ago }}
</time>
</template>

<script>
export default {
	props: {
		at: Number,
	},

	data () {
		return {
			selectedCategory: this.category,
		}
	},

	computed: {
		ago () {
			const results = []
			let time = this.$store.state.local.timeMinutely - this.at
			if (time < 30) {
				return 'now'
			}
			const secondsInHour = 60 * 60
			const secondsInDay = 24 * secondsInHour
			{
				const secondsInMonth = 30.5 * secondsInDay
				const months = Math.floor(time / secondsInMonth)
				if (months >= 1) {
					results.push(`${months}mo`)
					time %= secondsInMonth
				}
			}
			{
				const days = Math.floor(time / secondsInDay)
				if (days >= 1) {
					results.push(`${days}d`)
					time %= secondsInDay
				}
			}
			if (results.length < 2) {
				const hours = Math.floor(time / secondsInHour)
				if (hours >= 1) {
					results.push(`${hours}h`)
					time %= secondsInHour
				}
				if (results.length < 2) {
					const minutes = Math.round(time / 60)
					if (minutes >= 1) {
						results.push(`${minutes}m`)
					}
				}
			}
			return `${results.join(' ')} ago`
		},
	},
}
</script>
