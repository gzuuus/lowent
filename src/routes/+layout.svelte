<script lang="ts">
	import '../app.postcss';
	import ndk, { ndkUser } from "$lib/stores/provider";
	import { AppShell, SlideToggle, LightSwitch, Drawer, type DrawerSettings } from '@skeletonlabs/skeleton';

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
	import { logout } from '$lib/helpers';
	import ShutdownIcon from '$lib/icons/shutdown-icon.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from "@skeletonlabs/skeleton";
	initializeStores();
	const drawerStore = getDrawerStore();
	
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	let currentTile: number
	let isAnon: boolean = $ndkUser ? false : true
	ndkUser.subscribe(() => {
		isAnon = $ndkUser ? false : true
	})
	$: {
		$appSetings.isAnon = isAnon
		if ($page.route.id?.split("/")[1] == "") {currentTile = 0} 
		else if ($page.route.id?.split("/")[1] == "r") {currentTile = 1}
	}

	function drawerOpen(): void {
		const s: DrawerSettings = { 
			id: 'side-nav',
			width: 'w-[280px] md:w-[480px]',
			padding: 'p-2',
			rounded: 'rounded-xl',
			position: 'left'
			};
		drawerStore.open(s);
	}
	$: classesDrawer = $drawerStore.id === 'side-nav' ? 'lg:hidden' : '';

</script>
<Drawer class="{classesDrawer}">
	<div class="flex flex-col h-full overflow-hidden">
		{#if $drawerStore.id === 'side-nav'}
			<div class="grid h-full py-2 px-2">
                Hello
            </div>
		{/if}
	</div>
</Drawer>
<!-- App Shell -->
<AppShell>
	<!-- <svelte:fragment slot="header">
	<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
		<svelte:fragment slot="lead"><button class="btn btn-sm variant-filled" on:click={drawerOpen}><OpenDrawerIcon size={22} flip={true} /></button></svelte:fragment>
		<h2 class="h3">{$page.params.r}</h2>
		<svelte:fragment slot="trail">(actions)</svelte:fragment>
	</AppBar>
	</svelte:fragment> -->
	<svelte:fragment slot="sidebarLeft">
	<AppRail>
		<AppRailTile bind:group={currentTile} name="tile-1" value={0} regionLead="w-fit m-auto" title="tile-1" on:click={() => goto('/')}>
			<svelte:fragment slot="lead"><HomeIcon size={22} /></svelte:fragment>
			<span>Home</span>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-1" value={1} regionLead="w-fit m-auto" title="tile-1" on:click={() => goto('/r')}>
			<svelte:fragment slot="lead"><GlobalIcon size={22} /></svelte:fragment>
			<span>Global</span>

		</AppRailTile>
		<div class="lg:hidden">
		{#each $appSetings.rTopics as topic }
		<AppRailTile bind:group={currentTile} name="tile-1" value={15} regionLead="w-fit m-auto" title="tile-1" on:click={() => goto('/r/' + topic + '/')}>
			<section class=" flex flex-col items-center gap-2 pt-2">
			<button class=" flex flex-col items-center" on:click={() => goto(`/r/${topic}`)}>
			<GlobalIcon size={12} />
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
					<button class="btn-icon btn-icon-sm variant-ghost" on:click={logout}><ShutdownIcon size={16} /></button>
				</div>
			</AppRailAnchor>
			<AppRailAnchor title="Account" name="tile-4">
				<div class=" flex flex-col items-center">
					<span>{isAnon ? "Anon" : $ndkUser?.profile.name }</span>
					<SlideToggle name="slider-label"size="sm" bind:checked={isAnon}/>
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
					<Login mode={"secondary"}/>
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