<script lang="ts">
	import { goto } from '$app/navigation';
	import Login from '$lib/components/login.svelte';
	import { handleDeleteTopic } from '$lib/helpers';
	import Logo from '$lib/icons/Logo.svelte';
	import CloseIcon from '$lib/icons/close-icon.svelte';
	import CypherIcon from '$lib/icons/cipher-icon.svelte';
	import GlobalIcon from '$lib/icons/global-icon.svelte';
	import { appSettings } from '$lib/stores/localStore';
	import { nanoid } from 'nanoid';
	import { ndkUser } from '$lib/stores/provider';
	import GhIcon from '$lib/icons/gh-icon.svelte';
	let searchGoto: string;
	function onSearchKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			goto(`/r/${searchGoto}`);
		}
	}
</script>

<div class=" h-full flex flex-col items-center justify-center text-center">
	<section class=" sm:card w-fit p-4 flex flex-col gap-2 max-w-sm items-center">
		<section class=" self-center">
			<Logo size={75} />
		</section>
		<h1 class="h2">LowEnt</h1>
		<a href="https://github.com/gzuuus/lowent" target="_blank" rel="noopener noreferrer" class="btn-icon btn-icon-sm variant-soft"><GhIcon size={24} /></a>
		<p>Be anon, or not, chat freely about anything</p>
		<p class="opacity-50">
			Exploring the use of low-entropy keys to establish shared topics and rooms.
		</p>
		<div class="input-group input-group-divider grid-cols-[1fr_auto]">
			<input
				class="input"
				type="search"
				placeholder="Go to global room..."
				bind:value={searchGoto}
				on:keydown={onSearchKeydown}
			/>
			<button class="variant-filled-primary" on:click={() => goto(`/r/${searchGoto}`)}>go</button>
		</div>
		<span class=" opacity-40">Or</span>
		<button class=" btn variant-filled-primary" on:click={() => goto(`/c/${nanoid(12)}`)}
			>Create new cipher room</button
		>
		{#if $appSettings.rTopics.length}
			<span class=" inline-flex gap-2 items-center"><GlobalIcon size={16} /> Global rooms:</span>
			{#each $appSettings.rTopics as topic}
				<div class="btn-group variant-soft grid grid-cols-[1fr_auto]">
					<button
						class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap variant-soft"
						on:click={() => goto(`/r/${topic}`)}
					>
						{topic}
					</button>
					<button on:click={() => handleDeleteTopic(topic, 'r')}><CloseIcon size={16} /></button>
				</div>
			{/each}
		{/if}
		{#if $appSettings.cTopics.length}
			<span class=" inline-flex gap-2 items-center"><CypherIcon size={16} /> cipher rooms:</span>
			{#each $appSettings.cTopics as topic}
				<div class="btn-group variant-soft grid grid-cols-[1fr_auto]">
					<button
						class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap variant-soft"
						on:click={() => goto(`/c/${topic}`)}
					>
						{topic}
					</button>
					<button on:click={() => handleDeleteTopic(topic, 'c')}><CloseIcon size={16} /></button>
				</div>
			{/each}
		{/if}
	</section>
	{#if !$ndkUser}
	<section class=" sm:hidden block">
		<p class="opacity-50">If you want to chat using your identity, you can login</p>
		<Login mode={'primary'} />
	</section>
	{/if}
</div>
