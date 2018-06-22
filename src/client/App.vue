<template>
<div id="app">
	<div v-if="loading">
		Loading...
	</div>
	<router-view v-else class="content" />
</div>
</template>

<script>
export default {
	components: {
	},

	computed: {
		loading () {
			return this.$store.state.loading
		},
	},
}
</script>

<style lang="stylus">
#app
	font-family 'Avenir', Helvetica, Arial, sans-serif
	-webkit-font-smoothing antialiased
	-moz-osx-font-smoothing grayscale
	color #2

//PAGE

.content
	width 640px
	max-width 100%
	margin auto

//LAYOUT

.text-center
	text-align center

.text-small
	font-size 0.9em

.text-faint
	color #9

//CONTROLS

.big
	display block
	margin 8px auto
	max-width 100%
	text-align center
	box-sizing border-box

input.big
	width 320px
	height 44px
	font-size 24px
	border 1px solid #d
	border-radius 3px

.interactive, button
	transition-property background, color, opacity
	transition-duration 350ms
	transition-timing-function ease-out

button
	cursor pointer
	&:hover
		opacity 0.8

button.big
	width 256px
	box-sizing border-box
	height 44px
	font-size 24px
	background #e
	border-radius 3px
	border none
</style>
