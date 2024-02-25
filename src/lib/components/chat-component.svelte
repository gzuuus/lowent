<script lang="ts">
	// Components
	import NDK, {
		NDKPrivateKeySigner,
		NDKEvent,
		NDKNip07Signer,
		type NDKUserProfile
	} from '@nostr-dev-kit/ndk';
	import ndk, { ndkUser } from '$lib/stores/provider';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { appSetings } from '$lib/stores/localStore';
	import { goto } from '$app/navigation';
	import SendIcon from '$lib/icons/send-icon.svelte';
	import {
		announceTopic,
		fetchUserProfile,
		finaliceEvent,
		handleDeleteTopic,
		unixToDate,
		verifyAuthEvent
	} from '$lib/helpers';
	import type { idSignatureObj } from '$lib/interfaces';
	import { page } from '$app/stores';
	import CheckIcon from '$lib/icons/check-icon.svelte';
	import GlobalIcon from '$lib/icons/global-icon.svelte';
	import LinkOut from '$lib/icons/link-out.svelte';
	import { outNostrLinksUrl, outNostrLinksUrlCLient } from '$lib/stores/constants';
	import { npubEncode } from 'nostr-tools/nip19';
	export let r: string;
	export let rK: string;
	export let rP: string;
	export let isAnon: boolean = false;

	let elemChat: HTMLElement;

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
			tags: []
		};

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
			};
		}
		const signer = new NDKPrivateKeySigner(rK);
		$ndk.signer = signer;
		const ndkEventFinal = new NDKEvent($ndk);
		ndkEventFinal.kind = eventValues.kind;
		ndkEventFinal.created_at = eventValues.created_at;
		ndkEventFinal.content = eventValues.content;
		ndkEventFinal.tags = idSignatures
			? [
					['p', idSignatures.pubkAuthor],
					['e', idSignatures.idAuthor],
					['sig', idSignatures.sigAuthor]
				]
			: [];
		if (isAnon) {
			const finEvent = await finaliceEvent(ndkEventFinal);
			console.log(finEvent);
			ownerMessages.add(finEvent.id!);
		}
		await ndkEventFinal.publish();
		currentMessage = '';
		setTimeout(() => {
			scrollChatTop('smooth');
		}, 0);
	}

	function onPromptKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			addMessage(isAnon ? true : false);
		}
	}
	function onSearchKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			goto(`/${$page.route.id?.split('/')[1]}/${searchGoto}`);
		}
	}
	const chatMessages = $ndk.storeSubscribe(
		{
			kinds: [1],
			authors: [rP],
			limit: 10
		},
		{
			closeOnEose: false,
			groupable: true,
			groupableDelay: 100
		}
	);
	let roomProfile: NDKUserProfile | undefined;
	async function handleAnnounceTopic(): Promise<void> {
		await announceTopic(rP, r, rK);
		roomProfile = await fetchUserProfile(rP);
		roomProfile = roomProfile?.name ? roomProfile : undefined;
	}
	onMount(async () => {
		if (!$appSetings.rTopics.includes(r)) {
			appSetings.update((currentState) => {
				return {
					lastUserLogged: currentState.lastUserLogged,
					isAnon: currentState.isAnon,
					rTopics: [...currentState.rTopics, r]
				};
			});
		}
		roomProfile = await fetchUserProfile(rP);
		roomProfile = roomProfile?.name ? roomProfile : undefined;
		scrollChatTop();
	});
	onDestroy(() => {
		chatMessages.unsubscribe();
	});
	let searchGoto: string;
</script>

<div class="chat w-full h-full grid grid-cols-1 sm:grid-cols-[30%_1fr]">
	<!-- Navigation -->
	<div class="hidden sm:grid grid-rows-[auto_1fr_auto] border-r border-surface-500/30">
		<!-- Header -->
		<header class="border-b border-surface-500/30 p-4">
			<input
				class="input"
				type="search"
				placeholder="Go to room..."
				bind:value={searchGoto}
				on:keydown={onSearchKeydown}
			/>
		</header>
		<!-- List -->
		<div class="p-2 space-y-4 overflow-y-auto">
			<small class="opacity-50">Rooms</small>
			<div class="flex flex-col space-y-1">
				{#each $appSetings.rTopics as topic}
					<button
						type="button"
						class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap {topic === r
							? 'variant-filled-primary'
							: 'bg-surface-hover-token'} "
						on:click={() => goto(`/${$page.route.id?.split('/')[1]}/${topic}`)}
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
		<header class="grid grid-cols-[1fr_auto] h-fit border-b border-surface-700 px-2 items-center">
			<small>{r}</small>
			<section class=" inline-flex items-baseline">
				{#if !roomProfile}
					<button class="btn btn-sm" on:click={handleAnnounceTopic}
						><span class=" inline-flex gap-1 badge variant-ghost"
							><GlobalIcon size={16} />Announce</span
						></button
					>
				{/if}
				<a
					href={roomProfile
						? `${outNostrLinksUrl}/${npubEncode(rP)}`
						: `${outNostrLinksUrlCLient}/${npubEncode(rP)}/notes`}
					target="_blank"
					rel="noreferrer"
					><span class=" inline-flex gap-1 badge variant-ghost"
						><LinkOut size={16} />See outside</span
					></a
				>
			</section>
		</header>
		<section bind:this={elemChat} class="p-4 overflow-y-auto space-y-4">
			{#each $chatMessages as bubble}
				{#if bubble.tagValue('p') == undefined && !ownerMessages.has(bubble.id)}
					<div class="grid grid-cols-[auto_1fr] gap-2">
						<Avatar initials={r} width="w-12" background="bg-surface-500/30" />
						<div class="card p-4 rounded-tl-none space-y-2 variant-soft-primary">
							<header class="flex justify-between items-center flex-wrap">
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
						<div class="card p-4 variant-soft border-r-2 rounded-tl-none space-y-2">
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
					{#await fetchUserProfile(bubble.tagValue('p')) then value}
						<div class="grid grid-cols-[1fr_auto] gap-2">
							<div class="card p-4 variant-soft border-r-2 rounded-tl-none space-y-2">
								<header class="flex justify-between items-center">
									<p class="font-bold">{value?.name}</p>
									<small class="opacity-50">
										{unixToDate(bubble.created_at ? bubble.created_at : Date.now())}
									</small>
								</header>
								<p>{bubble.content}</p>
							</div>
							<Avatar
								initials={value?.name}
								src={value?.picture ? value?.picture : value?.image}
								width="w-12"
							/>
						</div>
					{/await}
				{:else if bubble.tagValue('p') && bubble.tagValue('sig')}
					<div class="grid grid-cols-[auto_1fr] gap-2">
						{#await fetchUserProfile(bubble.tagValue('p')) then value}
							<Avatar
								initials={value?.name}
								src={value?.picture ? value?.picture : value?.image}
								width="w-12"
							/>
							<div
								class="card p-4 rounded-tr-none space-y-2 border-l-2 border-opacity-5 variant-soft-primary"
							>
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
				<button
					class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'}
					on:click={() => addMessage(isAnon ? true : false)}
				>
					<SendIcon size={16} />
				</button>
			</div>
			<!-- Publishing as: {isAnon ? "Anon" : $ndkUser?.profile?.name} -->
		</section>
	</div>
</div>
