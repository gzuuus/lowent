<script lang="ts">
	import { fetchUserProfile, unixToDate, verifyAuthEvent } from "$lib/helpers";
	import CheckIcon from "$lib/icons/check-icon.svelte";
	import { ownDb, type ownedMsgs } from "$lib/stores/ownerMsgsDb";
	import { ndkUser } from "$lib/stores/provider";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import { Avatar } from "@skeletonlabs/skeleton";
	import { npubEncode } from "nostr-tools/nip19";
	import { onMount } from "svelte";
	import ChatContentParser from "./chat-content-parser.svelte";
    export let bubble: NDKEvent;
    export let r: string;
    let ownId: ownedMsgs | null; 
	const verifyOwnedMsg = async() => {
		return ownDb.ownedMsgs.where({ id: bubble.id }).first().then((result) => {
			ownId = result || null;
		});
	};
    onMount(async() => {
		await verifyOwnedMsg();
	});
</script>
{#if bubble.tagValue('sig') == undefined}
<div class="grid {ownId ? 'grid grid-cols-[1fr_auto]' : 'grid-cols-[auto_1fr]'} gap-1">
    {#if !ownId}<Avatar initials={r} width="w-11" background="bg-surface-500/30" />{/if}
    <div class="card p-2 rounded-tl-none variant-soft-primary {ownId ? 'variant-soft' : 'variant-soft-primary'}">
        <header class="flex justify-between items-center flex-wrap">
            <p class="font-bold">{r}</p>
            <small class="opacity-50">
                {unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
            </small>
        </header>
        <ChatContentParser content={bubble.content} />
    </div>
    {#if ownId}<Avatar initials={r} width="w-11" background="bg-surface-500/30" />{/if}
</div>
{:else if $ndkUser?.pubkey == bubble.tagValue('p')}
{#await fetchUserProfile(bubble.tagValue('p')) then value}
    <div class="grid grid-cols-[1fr_auto] gap-2">
        <div class="card p-2 variant-soft border-r-2 rounded-tl-none">
            <header class="flex justify-between items-center">
                <p class="font-bold">{value?.name}</p>
                <small class="opacity-50">
                    {unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
                </small>
            </header>
            <ChatContentParser content={bubble.content} />
        </div>
        <Avatar
            initials={value?.name}
            src={value?.picture ? value?.picture : value?.image}
            width="w-11"
        />
    </div>
{/await}
{:else}
<div class="grid grid-cols-[auto_1fr] gap-2">
    {#await fetchUserProfile(bubble.tagValue('p')) then value}
        <Avatar
            initials={value?.name}
            src={value?.picture ? value?.picture : value?.image}
            width="w-11"
        />
        <div
            class="card p-2 rounded-tr-none border-l-2 border-opacity-5 variant-soft-primary"
        >
            <header class="flex justify-between items-center">
                <section class=" inline-flex gap-1">
                    <p class="font-bold">
                        {value?.name}
                    </p>
                    <small class="opacity-50">{npubEncode(bubble.tagValue('p') ?? "").substring(0, 16)}...</small>
                </section>
                <small class="opacity-50 inline-flex items-center gap-1">
                        {#if verifyAuthEvent(bubble, bubble.tagValue('p'), bubble.tagValue('e'), bubble.tagValue('sig'))}
                            <CheckIcon size={16} />
                        {/if}
                    {unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
                </small>
            </header>
            <ChatContentParser content={bubble.content} />
        </div>
    {/await}
</div>
{/if}