<script lang="ts">
	import { goto } from '$app/navigation';
	import { handleDeleteTopic } from '$lib/helpers';
	import CloseIcon from '$lib/icons/close-icon.svelte';
	import GlobalIcon from '$lib/icons/global-icon.svelte';
	import HomeIcon from '$lib/icons/home-icon.svelte';
	import SearchIcon from '$lib/icons/search-icon.svelte';
	import { appSettings } from '$lib/stores/localStore';
	import Login from './login.svelte';
	import { ndkUser } from '$lib/stores/provider';
	import AnonToggle from './anon-toggle.svelte';
	import { LightSwitch, getDrawerStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import CipherIcon from '$lib/icons/cipher-icon.svelte';
	import { nanoid } from 'nanoid';
	const drawerStore = getDrawerStore();
	let searchGoto: string;
	let toggleSearch: boolean = false;
	let pageCtx: string = get(page).url.pathname;

	function onSearchKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			goto(`/r/${searchGoto}`);
		}
	}

	$: if (pageCtx != $page.url.pathname) {
		drawerStore.close();
		pageCtx = $page.url.pathname;
	}
</script>

<div class=" grid grid-rows-[auto_1fr_auto] gap-2">
	<div class=" flex flex-col gap-2">
		<section class="flex flex-row justify-between px-2">
			<section>
				<button
					type="button"
					class="btn-icon btn-icon-sm variant-filled"
					on:click={() => goto('/')}
				>
					<HomeIcon size={16} />
				</button>
				<button
					type="button"
					class="btn-icon btn-icon-sm variant-filled"
					on:click={() => (toggleSearch = !toggleSearch)}
				>
					<SearchIcon size={16} />
				</button>
				<button
					type="button"
					class="btn-icon btn-icon-sm variant-filled"
					on:click={() => goto(`/c/${nanoid(12)}`)}
				>
					<CipherIcon size={16} />
				</button>
			</section>
			<section class=" flex flex-row items-center gap-2">
				<Login mode={'secondary'} />
			</section>
		</section>
		<section
			class="{toggleSearch ? 'input-group' : 'hidden'} input-group-divider grid-cols-[1fr_auto]"
		>
			<input
				class="input"
				type="search"
				placeholder="Go to room..."
				bind:value={searchGoto}
				on:keydown={onSearchKeydown}
			/>
			<button class="variant-filled-primary" on:click={() => goto(`/r/${searchGoto}`)}>go</button>
		</section>
	</div>
	<div class="flex flex-col gap-1">
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
			<span class=" inline-flex gap-2 items-center"><CipherIcon size={16} /> cipher rooms:</span>
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
			<button
				type="button"
				class="btn p-2 w-full flex items-center variant-ghost-primary"
				on:click={() => goto(`/c/${nanoid(12)}`)}
			>
				New secure cipher room
			</button>
		{/if}
	</div>
	<div class=" flex flex-row gap-2">
		<section class=" text-center">
			{#if $ndkUser}
				<span class=" opacity-70">Publishing as: </span><AnonToggle mode={'inline'} />
			{/if}
		</section>
		<section>
			<LightSwitch />
		</section>
	</div>
</div>
