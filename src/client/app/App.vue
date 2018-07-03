<template>
<div id="app">
	<NavBar v-if="hasSignin" />
	<div v-if="reconnectAttempts !== null" class="overlay">
		<h1 class="text-center">{{ reconnectAttempts }} attempts to reconnect</h1>
	</div>
	<div class="container">
		<router-view class="content" />
	</div>
</div>
</template>

<script>
import NavBar from '@/client/components/NavBar'

export default {
	components: {
		NavBar,
	},

	countdownInterval: null,

	computed: {
		hasSignin () {
			return this.$store.state.sessionToken
		},

		reconnectAttempts () {
			return this.$store.state.reconnectAttempts
		},
	},

	created () {
		if (document.hasFocus()) {
			this.setCountdown(false)
		}
		window.addEventListener('blur', this.cancelCountdown, true)
		window.addEventListener('focus', this.setCountdown, true)
	},

	beforeDestroy() {
		window.removeEventListener('blur', this.cancelCountdown, true)
		window.removeEventListener('focus', this.setCountdown, true)
	},

	methods: {
		cancelCountdown () {
			if (this.$options.countdownInterval) {
				window.clearInterval(this.$options.countdownInterval)
				this.$options.countdownInterval = null
			}
		},

		setCountdown (event) {
			if (this.$options.countdownInterval) {
				return
			}
			this.$options.countdownInterval = window.setInterval(this.passiveUpdate, 60 * 1000)
			if (event) {
				this.passiveUpdate()
			}
		},

		passiveUpdate () {
			this.$store.commit('NOW')
		},
	},
}
</script>

<style lang="stylus">
body
	margin 0

#app
	font-family -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif
	-webkit-font-smoothing antialiased
	-moz-osx-font-smoothing grayscale
	color #2

a
	color #f83
	text-decoration none
	transition color 300ms ease-out
	&:hover
		color #fa6
		&:active
			color #fc8

.router-link-exact-active
	color inherit !important
	cursor default

//PAGE

.container
	width 512px
	max-width 100%
	margin auto
	box-sizing border-box
	padding 8px

.content
	width 100%

.overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	z-index 9001
	background rgba(#f, 0.5)
	color #e33

//LAYOUT

.flex
	display flex
	align-items center

.inline
	display inline-block

.text-center
	text-align center

.text-small
	font-size 0.9em

.text-faint
	color #9

ul
	padding 0
	list-style none

.show-hover .show-hovered
	visibility hidden
.show-hover:hover .show-hovered
	visibility visible

//CONTROLS

fieldset
	border none
	margin 0
	padding 0
	width 100%
	max-width 100%
	box-sizing border-box

button, textarea, input
	outline none
	box-sizing border-box

.big
	display block
	margin 8px auto !important
	max-width 100%

input.big
	width 320px
	height 44px
	font-size 24px
	border 1px solid #d
	border-radius 3px
	text-align center

textarea.big
	width 100%
	resize vertical
	min-height 48px
	max-height 160px
	border 1px solid #e8
	border-radius 5px
	text-align left
	font-size inherit
	padding 3px 6px

.interactive, button
	transition-property background, color, opacity
	transition-duration 350ms
	transition-timing-function ease-out

fieldset:disabled *
	cursor not-allowed !important
	opacity 0.5 !important

button
	cursor pointer
	&:hover
		opacity 0.7
		&:active
			opacity 0.4

button.big
	width 256px
	box-sizing border-box
	height 44px
	font-size 24px
	background #e8
	border-radius 3px
	border none
</style>
