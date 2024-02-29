<script lang="ts">
	import ChatComponent from '$lib/components/chat-component.svelte';
	import { type RoomParams } from '$lib/interfaces';
	import { hexToBytes } from '@noble/hashes/utils';
	import { getPublicKey } from 'nostr-tools';
	import { appSettings } from '$lib/stores/localStore.js';
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
		<ChatComponent {roomParams} isAnon={$appSettings.isAnon} type="c" />
	{/key}
{/if}
