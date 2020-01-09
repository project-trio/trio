<template>
<nav>
	<div class="container  text-secondary  flex justify-start">
		<TopicHero :topic="$options.topicData['TD']" />
		<TopicHero :topic="$options.topicData['Moba']" class="ml-6" />
	</div>
</nav>
</template>

<script>
import { TOPIC_DATA } from '@/common/constants'

import TopicHero from '@/client/components/Topic/Hero'

export default {
	components: {
		TopicHero,
	},

	topicData: TOPIC_DATA,
}
</script>
