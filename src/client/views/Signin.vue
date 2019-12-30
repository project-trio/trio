<template>
<div>
	<h1 class="text-center text-4xl">Welcome!</h1>
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
