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
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	let currentTile: number = 0;

	let isAnon: boolean = $ndkUser ? false : true;
	$: appSetings.update((currentState) => {
			return {
				lastUserLogged: currentState.lastUserLogged,
				isAnon: isAnon,
				rTopics: currentState.rTopics
			}
		})
</script>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="sidebarLeft">
	<AppRail>
		<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1" on:click={() => goto('/r')}>
			<svelte:fragment slot="lead">🌐</svelte:fragment>
			<span>Global</span>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-2" value={1} title="tile-2">
			<svelte:fragment slot="lead">(icon)</svelte:fragment>
			<span>Tile 2</span>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
			<svelte:fragment slot="lead">(icon)</svelte:fragment>
			<span>Tile 3</span>
		</AppRailTile>
		<!-- --- -->
		<svelte:fragment slot="trail">
			{#if $ndkUser?.profile?.name}
			<AppRailAnchor title="Account">
				<div class=" flex flex-col items-center">
					<span>{isAnon ? "Anon" : $ndkUser?.profile.name }</span>
					<SlideToggle name="slider-label"size="sm" bind:checked={isAnon}/>
				</div>
			</AppRailAnchor>
			{/if}
			<AppRailAnchor href="/" title="Account">
				Home
			</AppRailAnchor>
		</svelte:fragment>
	</AppRail>
	</svelte:fragment>
	<div class="h-screen p-4">
		<slot />
	</div>

</AppShell>