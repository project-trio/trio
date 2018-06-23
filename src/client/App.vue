<template>
<div id="app">
	<router-view class="content" />
</div>
</template>

<script>
export default {
	components: {
	},
}
</script>

<style lang="stylus">
#app
	font-family -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif
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

fieldset
	border none
	margin 0
	padding 0

button, textarea, input
	outline none

.big
	display block
	margin 8px auto !important
	max-width 100%
	box-sizing border-box

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
	max-height 256px
	border 1px solid #e8
	border-radius 5px
	text-align left
	font-size inherit
	padding 3px 6px

.interactive, button
	transition-property background, color, opacity
	transition-duration 350ms
	transition-timing-function ease-out

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
