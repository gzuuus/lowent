<script lang="ts">
	import '../app.postcss';
	import ndk, { ndkUser } from "$lib/stores/provider";
	import { AppShell, AppBar, SlideToggle } from '@skeletonlabs/skeleton';

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
</script>
<!-- App Shell -->
<AppShell>
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
		<svelte:fragment slot="trail">
			{#if $ndkUser?.profile?.name}
			<AppRailAnchor title="Account" name="tile-4">
				<div class=" flex flex-col items-center">
					<span>{isAnon ? "Anon" : $ndkUser?.profile.name }</span>
					<SlideToggle name="slider-label"size="sm" bind:checked={isAnon}/>
				</div>
			</AppRailAnchor>
			<AppRailAnchor title="Account" name="tile-4">
				<div class=" flex flex-col items-center">
					<button class="btn-icon btn-icon-sm variant-ghost" on:click={logout}><ShutdownIcon size={16} /></button>
				</div>
			</AppRailAnchor>
			{:else}
				<section class=" flex place-content-center py-2">
					<Login mode={"secondary"}/>
				</section>
			{/if}
		</svelte:fragment>
	</AppRail>
	</svelte:fragment>
	<div class="h-screen p-4">
		<slot />
	</div>

</AppShell>