<script lang="ts">
import ChatComponent from "$lib/components/chat-component.svelte";
import { page } from "$app/stores";
import {type RoomParams} from "$lib/interfaces";
	import { hexToBytes } from "@noble/hashes/utils";
    import { getPublicKey } from "nostr-tools";
	import { ndkUser } from "$lib/stores/provider.js";
	import { appSetings } from "$lib/stores/localStore.js";
    export let data;
let roomParams: RoomParams

$: roomParams = {
    r: data.r,
    rK: data.rK,
    rP: getPublicKey(hexToBytes(data.rK)),
}
</script>
{#key roomParams}
<ChatComponent rK={roomParams.rK} r={roomParams.r} rP={roomParams.rP} isAnon={$appSetings.isAnon} />
{/key}