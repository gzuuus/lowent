<script lang="ts">
	import '../app.postcss';
	import ndk, { ndkUser } from '$lib/stores/provider';
	import {
		AppShell,
		LightSwitch,
		Drawer,
		Modal,
		type ModalComponent,
		Toast,
		type DrawerSettings
	} from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { AppRail, AppRailTile, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { appSettings } from '$lib/stores/localStore';
	import { page } from '$app/stores';
	import HomeIcon from '$lib/icons/home-icon.svelte';
	import GlobalIcon from '$lib/icons/global-icon.svelte';
	import Login from '$lib/components/login.svelte';
	import { initializeAppSettings, logout } from '$lib/helpers';
	import ShutdownIcon from '$lib/icons/shutdown-icon.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import SideNav from '$lib/components/side-nav.svelte';
	import { onMount } from 'svelte';
	import { ownDb } from '$lib/stores/ownerMsgsDb';
	import AnonToggle from '$lib/components/anon-toggle.svelte';
	import NoExtensionModal from '$lib/components/modals/no-extension-modal.svelte';
	import CypherIcon from '$lib/icons/cipher-icon.svelte';
	import QrModal from '$lib/components/modals/qr-modal.svelte';
	import AnnounceModal from '$lib/components/modals/announce-modal.svelte';
	import SearchIcon from '$lib/icons/search-icon.svelte';
	import HamMenuIcon from '$lib/icons/ham-menu-icon.svelte';
	initializeStores();
	initializeAppSettings();
	const drawerStore = getDrawerStore();

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	const modalRegistry: Record<string, ModalComponent> = {
		modalNoNip07: { ref: NoExtensionModal },
		modalQr: { ref: QrModal },
		modalAnnounce: { ref: AnnounceModal }
	};
	let currentTile: string | number = 0;
	let isAnon: boolean = $ndkUser ? false : true;
	ndkUser.subscribe(() => {
		isAnon = $ndkUser ? false : true;
	});
	$: {
		$appSettings.isAnon = isAnon;
		if ($page.route.id?.split('/')[1] == '') {
			currentTile = 0;
		} else if ($page.route.id?.split('/')[1] == 'r') {
			currentTile = 1;
		} else if ($page.route.id?.split('/')[1] == 'c') {
			currentTile = 2;
		} else if ($page.route.id?.split('/')[1] == 'search') {
			currentTile = 3;
		}
	}

	$: classesDrawer = $drawerStore.id === 'side-nav' ? 'sm:hidden' : '';

	function drawerOpen(): void {
		const s: DrawerSettings = {
			id: 'side-nav',
			width: 'w-[280px] md:w-[480px]',
			padding: 'p-2',
			rounded: 'rounded-xl',
			position: 'right'
		};
		drawerStore.open(s);
	}

	onMount(async () => {
		await ownDb.open();		
	});
</script>

<svelte:head>
	<title>LowEnt</title>
	<meta name="description" content="Be anon, or not, chat freely about anything" />
	<meta property="og:title" content="LowEnt" />
	<meta property="og:description" content="Be anon, or not, chat freely about anything" />
</svelte:head>
<Modal components={modalRegistry} />
<Toast />
<Drawer class={classesDrawer}>
	<div class="flex flex-col h-full overflow-hidden">
		{#if $drawerStore.id === 'side-nav'}
			<div class="grid h-full py-2 px-2">
				<SideNav />
			</div>
		{/if}
	</div>
</Drawer>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
	{#if !$page.route.id?.split('/')[1].includes('r' || 'c')}
	<div class=" w-full flex justify-between variant-soft items-center px-2 py-1">
		<section class=" flex flex-row items-center gap-1">
			LowEnt
		</section>

		<div class=" inline-flex items-center gap-2">
			<section class="sm:hidden flex">
				<button class=" badge variant-ghost" on:click={() => drawerOpen()}>
					<HamMenuIcon size={22} />
				</button>
			</section>
		</div>
	</div>
	{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<div class="hidden h-full sm:block">
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
						goto(`/r/${$appSettings.rTopics[0] ? $appSettings.rTopics[0] : ''}`)}
				>
					<svelte:fragment slot="lead"><GlobalIcon size={22} /></svelte:fragment>
					<span>Rooms</span>
				</AppRailTile>
				<AppRailTile
					bind:group={currentTile}
					name="tile-1"
					value={2}
					regionLead="w-fit m-auto"
					title="tile-1"
					on:click={() => goto(`/c/${$appSettings.cTopics[0] ? $appSettings.cTopics[0] : ''}`)}
				>
					<svelte:fragment slot="lead"><CypherIcon size={22} /></svelte:fragment>
					<span>Cipher</span>
				</AppRailTile>
				<AppRailTile
					bind:group={currentTile}
					name="tile-1"
					value={3}
					regionLead="w-fit m-auto"
					title="tile-1"
					on:click={() => goto('/search')}
				>
					<svelte:fragment slot="lead"><SearchIcon size={22} /></svelte:fragment>
					<span>Search</span>
				</AppRailTile>
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
							<AnonToggle />
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
		</div>
	</svelte:fragment>
	<slot />
</AppShell>
