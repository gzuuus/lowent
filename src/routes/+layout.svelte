<script lang="ts">
	import '../app.postcss';
	import ndk, { ndkUser } from '$lib/stores/provider';
	import { AppShell, SlideToggle, LightSwitch, Drawer } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { AppRail, AppRailTile, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { appSetings } from '$lib/stores/localStore';
	import { page } from '$app/stores';
	import HomeIcon from '$lib/icons/home-icon.svelte';
	import GlobalIcon from '$lib/icons/global-icon.svelte';
	import Login from '$lib/components/login.svelte';
	import { handleDeleteTopic, logout } from '$lib/helpers';
	import ShutdownIcon from '$lib/icons/shutdown-icon.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import CloseIcon from '$lib/icons/close-icon.svelte';
	initializeStores();
	const drawerStore = getDrawerStore();

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	let currentTile: string | number = 0;
	let isAnon: boolean = $ndkUser ? false : true;
	ndkUser.subscribe(() => {
		isAnon = $ndkUser ? false : true;
	});
	$: {
		$appSetings.isAnon = isAnon;
		if ($page.route.id?.split('/')[1] == '') {
			currentTile = 0;
		} else if ($page.route.id?.split('/')[1] == 'r') {
			currentTile = 1;
		}
	}

	$: classesDrawer = $drawerStore.id === 'side-nav' ? 'sm:hidden' : '';
</script>

<svelte:head>
	<title>LowEnt</title>
	<meta name="description" content="Be anon, or not, chat freely about anything" />
	<meta property="og:title" content="LowEnt" />
	<meta property="og:description" content="Be anon, or not, chat freely about anything" />
</svelte:head>
<Drawer class={classesDrawer}>
	<div class="flex flex-col h-full overflow-hidden">
		{#if $drawerStore.id === 'side-nav'}
			<div class="grid h-full py-2 px-2">Hello</div>
		{/if}
	</div>
</Drawer>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="sidebarLeft">
		<AppRail>
			<AppRailTile
				bind:group={currentTile}
				name="tile-1"
				value={0}
				regionLead="w-fit m-auto"
				title="tile-1"
				on:click={() => goto('/')}
			>
				<svelte:fragment slot="lead">
					<HomeIcon size={22} />
				</svelte:fragment>
				<span>Home</span>
			</AppRailTile>
			<AppRailTile
				bind:group={currentTile}
				name="tile-1"
				value={1}
				regionLead="w-fit m-auto"
				title="tile-1"
				on:click={() =>
					goto(`/r/${$appSetings.rTopics[0] ? $appSetings.rTopics[0] : 'LowEnt[Help]'}`)}
			>
				<svelte:fragment slot="lead"><GlobalIcon size={22} /></svelte:fragment>
				<span>Global</span>
			</AppRailTile>
			<div class="sm:hidden">
				{#each $appSetings.rTopics as topic}
					<AppRailTile
						bind:group={currentTile}
						name="tile-1"
						value={10}
						regionLead="w-fit m-auto"
						title="tile-1"
						on:click={() => goto('/r/' + topic + '/')}
					>
						<section
							class=" flex flex-col items-center gap-2 py-2 {$page.data.r === topic
								? 'border-b border-primary-400'
								: ''}"
						>
							<button class=" flex flex-col items-center" on:click={() => goto(`/r/${topic}`)}>
								{#if $page.data.r === topic}
									<button
										class="hover:variant-outline-error p-1 m-2 rounded"
										on:click={() => handleDeleteTopic(topic)}><CloseIcon size={16} /></button
									>
								{:else}
									<span class=" p-1 m-2 rounded"><GlobalIcon size={12} /></span>
								{/if}

								<small>{topic}</small>
							</button>
						</section>
					</AppRailTile>
				{/each}
			</div>

			<svelte:fragment slot="trail">
				{#if $ndkUser?.profile?.name}
					<AppRailAnchor title="Account" name="tile-4">
						<div class=" flex flex-col items-center">
							<button class="btn-icon btn-icon-sm variant-ghost" on:click={logout}
								><ShutdownIcon size={16} /></button
							>
						</div>
					</AppRailAnchor>
					<AppRailAnchor title="Account" name="tile-4">
						<div class=" flex flex-col items-center">
							<span>{isAnon ? 'Anon' : $ndkUser?.profile.name}</span>
							<SlideToggle name="slider-label" size="sm" bind:checked={isAnon} />
						</div>
					</AppRailAnchor>
					<AppRailAnchor>
						<section class=" flex place-content-center py-2">
							<LightSwitch />
						</section>
					</AppRailAnchor>
				{:else}
					<AppRailAnchor>
						<section class=" flex place-content-center py-2">
							<Login mode={'secondary'} />
						</section>
					</AppRailAnchor>
					<AppRailAnchor>
						<section class=" flex place-content-center py-2">
							<LightSwitch />
						</section>
					</AppRailAnchor>
				{/if}
			</svelte:fragment>
		</AppRail>
	</svelte:fragment>
	<div class="h-screen p-4">
		<slot />
	</div>
</AppShell>
