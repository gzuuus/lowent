<script lang="ts">
	import ChatComponent from '$lib/components/chat-component.svelte';
	import { type RoomParams } from '$lib/interfaces';
	import { hexToBytes } from '@noble/hashes/utils';
	import { getPublicKey } from 'nostr-tools';
	import { appSetings } from '$lib/stores/localStore.js';
	import { browser } from '$app/environment';
	export let data;
	let roomParams: RoomParams;

	$: roomParams = {
		r: data.r,
		rK: data.rK,
		rP: getPublicKey(hexToBytes(data.rK))
	};
</script>
{#if browser}
{#key roomParams}
	<ChatComponent
		rK={roomParams.rK}
		r={roomParams.r}
		rP={roomParams.rP}
		isAnon={$appSetings.isAnon}
	/>
{/key}
{/if}