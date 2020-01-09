<template>
<div class="h-12  flex items-start">
	<a :href="externalURL" target="_blank">
		<TopicIcon :topic="topic" class="w-12 rounded" />
	</a>
	<div class="h-full  flex flex-col justify-center">
		<router-link :to="{ name: 'Topic', params: { name: topic.name } }" class="entry  text-lg">{{ topic.name }}</router-link>
		<a :href="externalURL" target="_blank" class="entry  text-sm font-semibold">Play <span class="external">⇱</span></a>
	</div>
</div>
</template>

<script>
import TopicIcon from '@/client/components/Topic/Icon'

export default {
	components: {
		TopicIcon,
	},

	props: {
		topic: Object,
	},

	computed: {
		externalURL () {
			return `https://${this.topic.subdomain}.netlify.com`
		},
	},
}
</script>

<style lang="postcss" scoped>
.entry {
	@apply px-1;
}

.external {
	@apply inline-block;
	transform: rotateY(180deg);
}
</style>
