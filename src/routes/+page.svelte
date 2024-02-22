<script lang="ts">
	import { goto } from "$app/navigation";
	let searchGoto: string;
	function onSearchKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			goto(`/r/${searchGoto}`);
		}
	}
</script>
<div class=" h-full flex items-center justify-center text-center">
	<section class=" card w-fit p-4 flex flex-col gap-2 max-w-sm">
		<h1 class="h1">LowEnt</h1>
		<p>Be anon, or not, chat freely about anything</p>
		<div class="input-group input-group-divider grid-cols-[1fr_auto]">
			<input class="input" type="search" placeholder="Go to room..." bind:value={searchGoto} on:keydown={onSearchKeydown} />
			<button class="variant-filled" on:click={() => goto(`/r/${searchGoto}`)}>go</button>
		</div>
	<div>
		<!-- {#if !$ndkUser}
		<Login mode={"primary-sm"}/>
		{:else}
		<button class="btn btn-sm variant-filled" on:click={logout}>Logout</button>
		{/if} -->
	</div>
	</section>
</div>