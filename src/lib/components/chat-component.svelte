<script lang="ts">
	// Components
	import NDK, { NDKPrivateKeySigner, NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";
	import ndk, { ndkUser } from "$lib/stores/provider";
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { type Event, verifyEvent } from "nostr-tools";
	import { appSetings } from "$lib/stores/localStore";
	import { goto } from "$app/navigation";
	import SendIcon from "$lib/icons/send-icon.svelte";
	import { fetchUserProfile, finaliceEvent, unixToDate, verifyAuthEvent } from "$lib/helpers";
	import type { idSignatureObj } from "$lib/interfaces";
	import { page } from "$app/stores";
	import CheckIcon from "$lib/icons/check-icon.svelte";
	export let r: string;
	export let rK: string;
	export let rP: string;
	export let isAnon:boolean = false;
	const signer = new NDKPrivateKeySigner(rK);
	$ndk.signer = signer;

	// interface MessageFeed {
	// 	id: number;
	// 	host: boolean;
	// 	avatar: number;
	// 	name: string;
	// 	timestamp: string;
	// 	message: string;
	// 	color: string;
	// }

	let elemChat: HTMLElement;

	// Messages
	// let messageFeed: MessageFeed[] = [];
	let ownerMessages = new Set<string>([]);
	let currentMessage = '';

	function scrollChatTop(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: 0, behavior });
	}

	async function addMessage(isAnon: boolean): Promise<void> {
	let eventValues = {
		kind: 1,
		created_at: Math.floor(Date.now() / 1000),
		content: currentMessage,
		tags: [],
	}

	let idSignatures: idSignatureObj | undefined = undefined;

	if (!isAnon) {
		const authSigner = new NDKNip07Signer();
		const signInstance = new NDK();
		signInstance.signer = authSigner;
		
		const ndkEvent = new NDKEvent(signInstance);
		ndkEvent.kind = eventValues.kind;
		ndkEvent.created_at = eventValues.created_at;
		ndkEvent.content = eventValues.content;
		ndkEvent.tags = eventValues.tags;

		const finEvent = await finaliceEvent(ndkEvent);
		idSignatures = {
			pubkAuthor: finEvent.pubkey!,
			idAuthor: finEvent.id!,
			sigAuthor: finEvent.sig!
		}
		console.log(verifyEvent(finEvent as Event));
	}

	const ndkEventFinal = new NDKEvent($ndk);
	ndkEventFinal.kind = eventValues.kind;
	ndkEventFinal.created_at = eventValues.created_at;
	ndkEventFinal.content = eventValues.content;
	ndkEventFinal.tags = idSignatures 
	? [
		["p", idSignatures.pubkAuthor],
		["e", idSignatures.idAuthor],
		["sig", idSignatures.sigAuthor]
	] 
	: [] ;
	if (isAnon) {
		const finEvent = await finaliceEvent(ndkEventFinal);
		console.log(finEvent)
		ownerMessages.add(finEvent.id!);
	}
	console.log(await ndkEventFinal.publish());
	currentMessage = '';
	setTimeout(() => {
		scrollChatTop('smooth');
	}, 0);
}

	// async function addMessage(): Promise<void> {
	// 	const authSigner = new NDKNip07Signer();
	// 	const tempNDK = new NDK();
	// 	tempNDK.signer = authSigner;
	// 	const ndkEvent = new NDKEvent($ndk);
	// 	ndkEvent.kind = 1;
	// 	ndkEvent.content = currentMessage;
	// 	ndkEvent.tags = []
	// 	ndkEvent.created_at = Math.floor(Date.now() / 1000);
	// 	// let eventId = eventHash(ndkEvent);
	// 	// ownerMessages.add(eventId);
	// 	let finEvent = await finaliceEvent(ndkEvent);
		
	// 	console.log(finEvent)
	// 	// await ndkEvent.publish();
	// 	currentMessage = '';
	// 	setTimeout(() => {
	// 		scrollChatTop('smooth');
	// 	}, 0);
	// }

	function onPromptKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			addMessage(isAnon ? true : false);
		}
	}
	function onSearchKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			goto(`/${$page.route.id?.split("/")[1]}/${searchGoto}`);
		}
	}
    const chatMessages = $ndk.storeSubscribe(
        {
			kinds: [1],
			authors: [rP],
			limit: 10
		},
        { closeOnEose: false },
    );

	function handleDeleteTopic(topic: string): void {
		// appSetings.update((currentValues) => currentValues.filter((value) => value !== topic));
		appSetings.update((currentState) => {
			return {
				lastUserLogged: currentState.lastUserLogged,
				isAnon: currentState.isAnon,
				rTopics: currentState.rTopics.filter((value) => value !== topic),
		}});
		console.log($appSetings.rTopics);
		if ($appSetings.rTopics.length == 0) {goto("/")} else goto(`/${$page.route.id?.split("/")[1]}/${$appSetings.rTopics[0]}`);
	}

	onMount(() => {
		if (!$appSetings.rTopics.includes(r)) {
		appSetings.update((currentState) => {
			return {
				lastUserLogged: currentState.lastUserLogged,
				isAnon: currentState.isAnon,
				rTopics: [...currentState.rTopics, r],
		}});
		}
		scrollChatTop();
	});
	onDestroy(() => {
		chatMessages.unsubscribe();
	})
	let searchGoto: string;
</script>
<div class="chat w-full h-full grid grid-cols-1 sm:grid-cols-[30%_1fr]">
<!-- Navigation -->
<div class="hidden sm:grid grid-rows-[auto_1fr_auto] border-r border-surface-500/30">
	<!-- Header -->
	<header class="border-b border-surface-500/30 p-4">
		<input class="input" type="search" placeholder="Go to room..." bind:value={searchGoto} on:keydown={onSearchKeydown} />
	</header>
	<!-- List -->
	<div class="p-2 space-y-4 overflow-y-auto">
		<small class="opacity-50">Rooms</small>
		<div class="flex flex-col space-y-1">
			{#each $appSetings.rTopics as topic}
				<button
					type="button"
					class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap {topic === r ? 'variant-filled-primary' : 'bg-surface-hover-token'} "
					on:click={() => goto(`/${$page.route.id?.split("/")[1]}/${topic}`)}
				>
					<Avatar initials="X" width="w-6" on:click={() => handleDeleteTopic(topic)} />
					<span class="flex-1 text-start">
						{topic}
					</span>
				</button>
			{/each}

		</div>
	</div>
</div>
<!-- Chat -->
<div class="grid grid-rows-[1fr_auto] h-full max-h-screen">
    <!-- Conversation -->
    <section bind:this={elemChat} class="p-4 overflow-y-auto space-y-4">
		{#each $chatMessages as bubble}
			{#if bubble.pubkey == rP && bubble.tagValue('p') == undefined && !ownerMessages.has(bubble.id)}
				<div class="grid grid-cols-[auto_1fr] gap-2">
					<Avatar initials={r} width="w-12" />
					<div class="card p-4 rounded-tl-none space-y-2 variant-soft-primary">
						<header class="flex justify-between items-center">
							<p class="font-bold">{r}</p>
							<small class="opacity-50">
								{unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
							</small>
						</header>
						<p>{bubble.content}</p>
					</div>
				</div>
			{:else if ownerMessages.has(bubble.id)}
				<div class="grid grid-cols-[1fr_auto] gap-2">
					
					<div class="card p-4 variant-soft rounded-tl-none space-y-2">
						<header class="flex justify-between items-center">
							<p class="font-bold">{r}</p>
							<small class="opacity-50">
								{unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
							</small>
						</header>
						<p>{bubble.content}</p>
					</div>
					<Avatar initials={r} width="w-12" />
				</div>
			{:else if $ndkUser?.pubkey === bubble.tagValue('p')}
				{#await fetchUserProfile(bubble.tagValue('p')) then value }
					<div class="grid grid-cols-[1fr_auto] gap-2">
						<div class="card p-4 variant-soft rounded-tl-none space-y-2">
							<header class="flex justify-between items-center">
								<p class="font-bold">{value?.name}</p>
								<small class="opacity-50">
									{unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
								</small>
							</header>
							<p>{bubble.content}</p>
						</div>
						<Avatar initials={value?.name} src={value?.picture ? value?.picture : value?.image} width="w-12" />
					</div>
				{/await}
            {:else if bubble.tagValue('p') && bubble.tagValue('sig')}
                <div class="grid grid-cols-[auto_1fr] gap-2">
						{#await fetchUserProfile(bubble.tagValue('p')) then value }
						<Avatar initials={value?.name} src={value?.picture ? value?.picture : value?.image} width="w-12" />
						<div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
							<header class="flex justify-between items-center">
								<p class="font-bold">
											{value?.name}						
								</p>
								<small class="opacity-50 inline-flex items-center gap-1">
									{#if bubble.tagValue('sig')} 
										{#if verifyAuthEvent(bubble, bubble.tagValue('p'), bubble.tagValue('e'), bubble.tagValue('sig'))}
											<CheckIcon size={16} />
										{/if}
									{/if}
									{unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
								</small>
							</header>
							<p>{bubble.content}</p>
							</div>
						{/await}
                </div>
            {/if}
        {/each}
    </section>
    <!-- Prompt -->
    <section class="border-t border-surface-500/30 p-4 bottom-0 right-0">
        <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-container-token">
            <textarea
                bind:value={currentMessage}
                class="bg-transparent border-0 ring-0"
                name="prompt"
                id="prompt"
                placeholder="Write a message..."
                rows="1"
                on:keydown={onPromptKeydown}
            />
            <button class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'} on:click={() => addMessage(isAnon ? true : false)}>
                <SendIcon size={16} />
            </button>
        </div>
		<!-- Publishing as: {isAnon ? "Anon" : $ndkUser?.profile?.name} -->
    </section>
</div>
</div>