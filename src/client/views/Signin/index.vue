<template>
<div class="home">
	<h1 class="text-center">welcome!</h1>
	<SigninForm />
	<p class="text-small text-faint">Your email is used to authenticate your account, and is never shown publicly, spammed, or made available to a third party.</p>
</div>
</template>

<script>
import SigninForm from '@/client/views/Signin/Form'

export default {
	components: {
		SigninForm,
	},
}
</script>
