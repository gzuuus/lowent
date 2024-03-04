<script lang="ts">
	import { goto } from '$app/navigation';
	import HomeIcon from '$lib/icons/home-icon.svelte';
	import SearchIcon from '$lib/icons/search-icon.svelte';
	import Login from './login.svelte';
	import { ndkUser } from '$lib/stores/provider';
	import AnonToggle from './anon-toggle.svelte';
	import { LightSwitch, getDrawerStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import CipherIcon from '$lib/icons/cipher-icon.svelte';
	import { nanoid } from 'nanoid';
	import UserTopicList from './user-topic-list.svelte';
	const drawerStore = getDrawerStore();
	let pageCtx: string = get(page).url.pathname;

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
					on:click={() => goto('/search')}
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
	</div>
	<div class="flex flex-col gap-1">
		<UserTopicList />
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
