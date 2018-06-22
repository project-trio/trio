<template>
<div class="home">
	<h1 class="text-center">welcome!</h1>
	<SigninForm />
</div>
</template>

<script>
import SigninForm from '@/client/components/Signin/Form'

export default {
	components: {
		SigninForm,
	},
}
</script>
