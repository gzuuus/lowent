<script lang="ts">
	// Components
	import NDK, {
		NDKPrivateKeySigner,
		NDKEvent,
		NDKNip07Signer,
		type NDKUserProfile
	} from '@nostr-dev-kit/ndk';
	import ndk from '$lib/stores/provider';
	import { Avatar, type DrawerSettings } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { appSettings } from '$lib/stores/localStore';
	import { goto } from '$app/navigation';
	import SendIcon from '$lib/icons/send-icon.svelte';
	import {
	addIdToDb,
		announceTopic,
		fetchUserProfile,
		finaliceEvent,
		handleDeleteTopic,
	} from '$lib/helpers';
	import type { idSignatureObj } from '$lib/interfaces';
	import { page } from '$app/stores';
	import GlobalIcon from '$lib/icons/global-icon.svelte';
	import LinkOut from '$lib/icons/link-out.svelte';
	import { outNostrLinksUrl, outNostrLinksUrlCLient } from '$lib/stores/constants';
	import { npubEncode } from 'nostr-tools/nip19';
	import ChatBubble from './chat-bubble.svelte';
	import HamMenuIcon from '$lib/icons/ham-menu-icon.svelte';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	export let r: string;
	export let rK: string;
	export let rP: string;
	export let isAnon: boolean = false;
	const drawerStore = getDrawerStore();
	let elemChat: HTMLElement;

	let currentMessage = '';

	function scrollChatTop(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: 0, behavior });
	}

	async function addMessage(isAnon: boolean): Promise<void> {
		if (currentMessage === '') return;
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
		await addIdToDb((await finaliceEvent(ndkEventFinal)).id!);
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
	// async function handleAnnounceTopic(): Promise<void> {
	// 	await announceTopic(rP, r, rK);
	// 	roomProfile = await fetchUserProfile(rP);
	// 	roomProfile = roomProfile?.name ? roomProfile : undefined;
	// }
	let searchGoto: string;
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
		if (!$appSettings.rTopics.includes(r)) {
			appSettings.update((currentState) => {
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
				{#each $appSettings.rTopics as topic}
					<button
						type="button"
						class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap {topic === r
							? 'variant-filled-primary'
							: 'bg-surface-hover-token'} "
						on:click={() => goto(`/${$page.route.id?.split('/')[1]}/${topic}`)}
					>
						<Avatar initials="X" width="w-6" on:click={() => handleDeleteTopic(topic)} />
						<span class="flex-1 text-start break-all">
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
		<header class="flex flex-col h-fit border-b border-surface-700">
			<div class=" w-full flex justify-between variant-soft items-center px-2">
				<section class=" flex flex-row items-center gap-1">
					<span><GlobalIcon size={18} /></span>
					<span>r/<strong>{r}</strong></span>
				</section>
				<div class=" inline-flex items-center">
					<section class=" inline-flex items-baseline justify-end">
						<!-- {#if !roomProfile}
							<button class="btn btn-sm" on:click={handleAnnounceTopic}
								><span class=" inline-flex gap-1 badge variant-ghost"
									><GlobalIcon size={16} />Announce</span
								></button
							>
						{/if} -->
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
					<section class="sm:hidden flex">
						<button class=" btn-icon btn-icon-sm" on:click={() => drawerOpen()}>
							<HamMenuIcon size={22} />
						</button>
					</section>
				</div>
			</div>
		</header>
		<section bind:this={elemChat} class="p-2 overflow-y-scroll space-y-2 break-all">
			{#each $chatMessages as bubble (bubble.id)}
				<ChatBubble bubble={bubble} r={r}/>
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