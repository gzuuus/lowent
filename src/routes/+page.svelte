<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/icons/Logo.svelte';
	import { nanoid } from 'nanoid';
	import { ndkUser } from '$lib/stores/provider';
	import GhIcon from '$lib/icons/gh-icon.svelte';
	import SearchComponent from '$lib/components/search-component.svelte';
	import UserTopicList from '$lib/components/user-topic-list.svelte';
	import { appSettings } from '$lib/stores/localStore';
	import { browser } from '$app/environment';
	let searchGoto: string;
	let isExplore: boolean = $appSettings.cTopics.length || $appSettings.rTopics.length ? false : true;
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
		<button class=" btn variant-filled-primary w-full" on:click={() => goto(`/c/${nanoid(12)}`)}
			>Create new cipher room</button
		>
		<button class=" btn btn-sm variant-soft-primary w-full" on:click={() => isExplore = !isExplore}
			>{!isExplore ? 'Explore other rooms' : 'See your room list'}</button
		>
		{#if browser}
			{#if !isExplore}
				<UserTopicList />
			{:else}
				<span>Exploring announced rooms:</span>
				<SearchComponent searchQuery={' '} />
			{/if}
		{/if}
	</section>
</div>
