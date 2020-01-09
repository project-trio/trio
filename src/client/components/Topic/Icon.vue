<template>
<img :src="require(`@/client/assets/images/topics/${topic.id}.png`)">
</template>

<script>
export default {
	props: {
		topic: Object,
	},
}
</script>
