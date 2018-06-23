<template>
<div class="avatar" :style="{ 'background-image': `url(${avatarUrl})`, width: `${size}px`, height: `${size}px` }" />
</template>

<script>
export default {
	props: {
		size: Number,
		ccid: Number,
		md5: String,
	},

	computed: {
		avatarUrl () {
			const pixelSize = this.size * window.devicePixelRatio
			if (this.ccid) {
				return `http://storage.cloud.casualcollective.com/avatars/${Math.ceil(this.ccid / 5000)}/${this.ccid}${pixelSize <= 48 ? 't' : ''}.jpg`
			}
			const fallback = 'http://storage.cloud.casualcollective.com/avatars/avatar_small.png'
			if (this.md5) {
				return `https://www.gravatar.com/avatar/${this.md5}?s=${pixelSize}&${encodeURIComponent(fallback)}`
			}
			return fallback
		},
	},
}
</script>

<style lang="stylus">
.avatar
	background-size cover
	background-repeat no-repeat
	border-radius 2px
</style>
