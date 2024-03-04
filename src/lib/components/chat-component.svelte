<script lang="ts">
	// Components
	import NDK, {
		NDKPrivateKeySigner,
		NDKEvent,
		NDKNip07Signer,
		type NDKUserProfile
	} from '@nostr-dev-kit/ndk';
	import ndk from '$lib/stores/provider';
	import { Avatar, getModalStore, type DrawerSettings, type ModalSettings } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { appSettings } from '$lib/stores/localStore';
	import { goto } from '$app/navigation';
	import SendIcon from '$lib/icons/send-icon.svelte';
	import {
		addIdToDb,
		fetchUserProfile,
		finaliceEvent,
		handleDeleteTopic
	} from '$lib/helpers';
	import {
		typeKindMapping,
		type idSignatureObj,
		type TopicType,
		type RoomParams
	} from '$lib/interfaces';
	import { page } from '$app/stores';
	import LinkOut from '$lib/icons/link-out.svelte';
	import { outNostrLinksUrl, outNostrLinksUrlCLient } from '$lib/stores/constants';
	import { npubEncode } from 'nostr-tools/nip19';
	import ChatBubble from './chat-bubble.svelte';
	import HamMenuIcon from '$lib/icons/ham-menu-icon.svelte';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { encrypt } from 'nostr-tools/nip04';
	import QrIcon from '$lib/icons/qr-icon.svelte';
	import { nanoid } from 'nanoid';
	import EditIcon from '$lib/icons/edit-icon.svelte';
	import AnnounceIcon from '$lib/icons/announce-icon.svelte';
	import BackIcon from '$lib/icons/back-icon.svelte';
	export let roomParams: RoomParams;
	export let isAnon: boolean = false;
	export let type: TopicType;
	const drawerStore = getDrawerStore();
	const modalStore = getModalStore();
	
	let elemChat: HTMLElement;

	let currentMessage = '';

	function scrollChatTop(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: 0, behavior });
	}

	async function addMessage(isAnon: boolean): Promise<void> {
		if (currentMessage === '') return;
		let eventValues = {
			kind: typeKindMapping[type],
			created_at: Math.floor(Date.now() / 1000),
			content:
				type == 'c' ? await encrypt(roomParams.rK, roomParams.rP, currentMessage) : currentMessage,
			tags: []
		};
		// TODO: Study this for cipher rooms, may not be convenient
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
		const signer = new NDKPrivateKeySigner(roomParams.rK);
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
			goto(`/${type}/${searchGoto}`);
		}
	}
	const chatMessages = $ndk.storeSubscribe(
		{
			kinds: [typeKindMapping[type]],
			authors: [roomParams.rP],
			limit: 10
		},
		{
			closeOnEose: false,
			groupable: true,
			groupableDelay: 100
		}
	);
	let roomProfile: NDKUserProfile | undefined;
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
	function craftQrModal() {
		const modal: ModalSettings = {
		type: 'component',
		component: 'modalQr',
		meta: {
			toQr: $page.url.pathname.split('/').length > 2 ? $page.url.href : `${$page.url.href}/${roomParams.r}`
		}
		};
		modalStore.trigger(modal);
	}
	function craftAnnounceModal() {
		const modal: ModalSettings = {
		type: 'component',
		component: 'modalAnnounce',
		meta: {
			roomParams: roomParams,
			allowJoin: $page.url.pathname.split('/').length > 2 ? $page.url.href : `${$page.url.href}/${roomParams.r}`
		}
		};
		modalStore.trigger(modal);
	}
	$: roomAppSettings = type == 'r' ? $appSettings.rTopics : $appSettings.cTopics;
	onMount(async () => {
		if (!roomAppSettings.includes(roomParams.r)) {
			appSettings.update((currentState) => {
				return {
					lastUserLogged: currentState.lastUserLogged,
					isAnon: currentState.isAnon,
					rTopics: type == 'r' ? [...currentState.rTopics, roomParams.r] : currentState.rTopics,
					cTopics: type == 'c' ? [...currentState.cTopics, roomParams.r] : currentState.cTopics
				};
			});
		}
		roomProfile = await fetchUserProfile(roomParams.rP);
		roomProfile = roomProfile?.name ? roomProfile : undefined;
		scrollChatTop();
	});
	onDestroy(() => {
		chatMessages.unsubscribe();
	});
</script>

<div class="chat w-full h-full grid grid-cols-1 sm:grid-cols-[30%_1fr] lg:grid-cols-[20%_1fr]">
	<!-- Navigation -->
	<div class="hidden sm:grid grid-rows-[auto_1fr_auto] border-r border-surface-500/30">
		<!-- Header -->
		<header class="border-b border-surface-500/30 p-4 grid grid-cols-[1fr_auto]">
			<input
				class="input"
				type="search"
				placeholder="Go to room..."
				bind:value={searchGoto}
				on:keydown={onSearchKeydown}
			/>
			{#if searchGoto}
				<button
					type="submit"
					class="btn variant-filled-primary"
					on:click={() => goto(`/${type}/${searchGoto}`)}
				>
					Go
				</button>
			{/if}
		</header>
		<!-- List -->
		<div class="p-2 space-y-4 overflow-y-auto">
			<small class="opacity-50">Rooms</small>
			<div class="flex flex-col space-y-1">
				{#each roomAppSettings as topic}
					<button
						type="button"
						class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap {topic ===
						roomParams.r
							? 'variant-filled-primary'
							: 'bg-surface-hover-token'} "
						on:click={() => goto(`/${type}/${topic}`)}
					>
						<Avatar initials="X" width="w-6" on:click={() => handleDeleteTopic(topic, type)} />
						<span class="flex-1 text-start break-all">
							{topic}
							{#if roomProfile?.name}
								<br/>
								<small class=" text-xs opacity-60">{#if roomProfile?.name && topic == roomParams.r}({roomProfile.name}){/if}</small>
							{/if}
						</span>
					</button>
				{/each}
			</div>
		</div>
		{#if type == 'c'}
			<button
				type="button"
				class="btn p-2 w-full flex items-center variant-ghost-primary"
				on:click={() => goto(`/c/${nanoid(12)}`)}
			>
				New secure cipher room
			</button>
		{/if}
	</div>
	<!-- Chat -->
	<div class="grid grid-rows-[1fr_auto] h-full max-h-screen">
		<!-- Conversation -->
		<header class="flex flex-col h-fit border-b border-surface-700">
			<div class=" w-full flex justify-between variant-soft items-center px-2">
				<section class=" flex flex-row items-center gap-1">
					<button class="btn-icon btn-icon-sm" on:click={() => goto(`/`)}
					><BackIcon size={17} /></button
				>
					<span>{type}/<strong>{roomParams.r}</strong></span>
				</section>

				<div class=" inline-flex items-center gap-2">
					<section class=" inline-flex items-baseline justify-end">
							<button class="badge variant-ghost" on:click={craftQrModal}
								><QrIcon size={17} /></button
							>
							
						{#if type != 'c'}
						<button class="btn btn-sm" on:click={craftAnnounceModal}
							><span class=" badge variant-ghost"
								>
								{#if !roomProfile?.name}
								<AnnounceIcon size={17} />
								{:else}
								<EditIcon size={17} />
								{/if}
								</span
							></button
						>	
						<a
								href={roomProfile
									? `${outNostrLinksUrl}/${npubEncode(roomParams.rP)}`
									: `${outNostrLinksUrlCLient}/${npubEncode(roomParams.rP)}/notes`}
								target="_blank"
								rel="noreferrer"
								><span class=" badge variant-ghost"
									><LinkOut size={16} /></span
								></a
							>
						{/if}
					</section>
					<section class="sm:hidden flex">
						<button class=" badge variant-ghost" on:click={() => drawerOpen()}>
							<HamMenuIcon size={22} />
						</button>
					</section>
				</div>
			</div>
		</header>
		<section bind:this={elemChat} class="p-2 overflow-y-scroll space-y-2 break-all">
			{#each $chatMessages as bubble (bubble.id)}
				<ChatBubble {bubble} {roomParams} {type} />
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
		</section>
	</div>
</div>
