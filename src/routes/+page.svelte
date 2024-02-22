<script lang="ts">
	import Login from "$lib/components/login.svelte";
	import { logout } from "$lib/helpers";

</script>

<Login mode={"primary-sm"}/>
<button class="btn btn-sm variant-filled" on:click={logout}>Logout</button>
