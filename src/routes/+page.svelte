<script lang="ts">
	import { goto } from '$app/navigation';
	import Login from '$lib/components/login.svelte';
	import { handleDeleteTopic } from '$lib/helpers';
	import Logo from '$lib/icons/Logo.svelte';
	import CloseIcon from '$lib/icons/close-icon.svelte';
	import { appSettings } from '$lib/stores/localStore';
	let searchGoto: string;
	function onSearchKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			goto(`/r/${searchGoto}`);
		}
	}
</script>

<div class=" h-full flex flex-col items-center justify-center text-center">
	<section class=" sm:card w-fit p-4 flex flex-col gap-2 max-w-sm">
		<section class=" self-center">
			<Logo size={60} />
		</section>
		<h1 class="h2">LowEnt</h1>
		<h3 class="h4">(demo)</h3>
		<p>Be anon, or not, chat freely about anything</p>
		<p class="opacity-50">
			Exploring the use of low-entropy keys to establish shared topics and rooms.
		</p>
		<div class="input-group input-group-divider grid-cols-[1fr_auto]">
			<input
				class="input"
				type="search"
				placeholder="Go to room..."
				bind:value={searchGoto}
				on:keydown={onSearchKeydown}
			/>
			<button class="variant-filled-primary" on:click={() => goto(`/r/${searchGoto}`)}>go</button>
		</div>
		{#each $appSettings.rTopics as topic}
		<div class="btn-group variant-soft grid grid-cols-[1fr_auto]">
			<button
			 class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap variant-soft"
			 on:click={() => goto(`/r/${topic}`)}
			 >
				{topic}
			</button>
			<button on:click={() => handleDeleteTopic(topic)}><CloseIcon size={16} /></button>
		</div>
		{/each}
	</section>
	<section class=" sm:hidden flex">
		<Login mode={'primary'} />
	</section>
</div>
