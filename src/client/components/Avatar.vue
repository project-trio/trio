<template>
<div :style="{ 'background-image': `url(${avatarUrl})`, minWidth: `${size}px`, height: `${size}px` }" class="rounded-sm bg-cover bg-no-repeat" />
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
			const smallSize = pixelSize <= 48
			if (this.ccid) {
				return `http://storage.cloud.casualcollective.com/avatars/${Math.ceil(this.ccid / 5000)}/${this.ccid}${smallSize ? 't' : ''}.jpg`
			}
			const fallback = `http://storage.cloud.casualcollective.com/avatars/avatar_${smallSize ? 'small' : 'large'}.png`
			if (this.md5) {
				return `https://www.gravatar.com/avatar/${this.md5}?s=${pixelSize}&d=${encodeURIComponent(fallback)}`
			}
			return fallback
		},
	},
}
</script>
