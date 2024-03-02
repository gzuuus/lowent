import {
	NDKEvent,
	NDKNip07Signer,
	NDKPrivateKeySigner,
	type NDKUser,
	type NDKUserProfile,
	type NostrEvent
} from '@nostr-dev-kit/ndk';
import { get, get as getStore } from 'svelte/store';
import ndkStore, { defaulRelaysUrls, ndkUser } from '$lib/stores/provider';
import { getEventHash, verifyEvent } from 'nostr-tools';
import { appSettings } from './stores/localStore';
import { browser } from '$app/environment';
import { db } from '@nostr-dev-kit/ndk-cache-dexie';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { RelayList } from 'nostr-tools/kinds';
import { ownDb } from './stores/ownerMsgsDb';
import type { RoomParams } from './interfaces';

export async function NDKlogin(): Promise<NDKUser | undefined> {
	const $ndk = getStore(ndkStore);
	try {
		const signer = new NDKNip07Signer();
		$ndk.signer = signer;
		ndkStore.set($ndk);
		const ndkCurrentUser = await signer.user();
		let user = $ndk.getUser({
			npub: ndkCurrentUser.npub
		});
		await user.fetchProfile();
		ndkUser.set(user);
		appSettings.update((currentState) => {
			return {
				lastUserLogged: ndkCurrentUser.pubkey,
				isAnon: false,
				rTopics: currentState.rTopics,
				cTopics: currentState.cTopics
			};
		});
		return user;
	} catch (error) {
		return undefined;
	}
}

export function eventHash(ndkEvent: NDKEvent): string {
	let eventHash = getEventHash({
		kind: ndkEvent.kind ? ndkEvent.kind : 1,
		content: ndkEvent.content,
		pubkey: ndkEvent.pubkey,
		tags: ndkEvent.tags,
		created_at: ndkEvent.created_at!
	});
	return eventHash;
}

export async function finaliceEvent(ndkEvent: NDKEvent): Promise<NostrEvent> {
	let toEvent = await ndkEvent.toNostrEvent();
	let sigEvent = await ndkEvent.sign();
	toEvent.sig = sigEvent;
	return toEvent;
}

export function logout() {
	ndkUser.set(undefined);
	appSettings.update((currentState) => {
		return {
			lastUserLogged: undefined,
			isAnon: true,
			rTopics: currentState.rTopics,
			cTopics: currentState.cTopics
		};
	});
}

export function verifyAuthEvent(event: NDKEvent, p?: string, e?: string, sig?: string): boolean {
	return verifyEvent({
		id: e!,
		pubkey: p!,
		created_at: event.created_at!,
		kind: event.kind!,
		tags: [],
		content: event.content,
		sig: sig!
	});
}

export async function fetchUserProfile(
	opts: string | undefined
): Promise<NDKUserProfile | undefined> {
	try {
		if (browser) {
			const user = await db.users.where({ pubkey: opts }).first();
			console.log('cached user');
			if (!user) {
				console.log('no user');
				const ndk = getStore(ndkStore);
				const ndkUser = ndk.getUser({ pubkey: opts });
				console.log(ndkUser);
				await ndkUser.fetchProfile({
					closeOnEose: true,
					groupable: true,
					groupableDelay: 200
				});
				console.log(ndkUser);
				return ndkUser.profile as NDKUserProfile;
			} else {
				return user.profile as NDKUserProfile;
			}
		} else {
			return undefined;
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export function unixToDate(unixTimestamp: number) {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	};
	return new Date(unixTimestamp * 1000).toLocaleString('en-US', options);
}

export function handleDeleteTopic(topic: string, type: string): void {
	let $appSettings = get(appSettings);
	let $page = get(page);
	appSettings.update((currentState) => {
		return {
			lastUserLogged: currentState.lastUserLogged,
			isAnon: currentState.isAnon,
			rTopics:
				type == 'r'
					? currentState.rTopics.filter((value) => value !== topic)
					: currentState.rTopics,
			cTopics:
				type == 'c' ? currentState.cTopics.filter((value) => value !== topic) : currentState.cTopics
		};
	});
	if (
		(type == 'r' && $appSettings.rTopics.length == 0) ||
		(type == 'c' && $appSettings.cTopics.length == 0)
	) {
		goto('/');
	} else
		goto(
			`/${$page.route.id?.split('/')[1]}/${type == 'r' ? $appSettings.rTopics[0] : $appSettings.cTopics[0]}`
		);
}

export async function announceTopic(roomParams: RoomParams, customName?: string, allowJoin?: string) {
	// Todo Add tags for discovery
	const roomName = customName?.trim() != '' || undefined ? customName : roomParams.r
	const ndk = get(ndkStore);
	const topic = ndk.getUser({ pubkey: roomParams.rP });
	await topic.fetchProfile();
	topic.profile!.name = roomName;
	topic.profile!.about = `Topic: ${roomName}${allowJoin ? `, Connect: ${allowJoin}`: ''}`;
	topic.profile!.website = allowJoin ? allowJoin : undefined;
	const signer = new NDKPrivateKeySigner(roomParams.rK);
	ndk.signer = signer;
	const relayListEvent = new NDKEvent(ndk);
	relayListEvent.kind = RelayList;
	relayListEvent.tags = defaulRelaysUrls.map((url) => ['r', url]);
	await relayListEvent.publish();
	await topic.publish();
}

export async function addIdToDb(idToAdd: string): Promise<boolean> {
	try {
		const id = await ownDb.ownedMsgs.add({
			id: idToAdd
		});
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export function initializeAppSettings() {
	appSettings.update((currentState) => ({
		lastUserLogged: currentState.lastUserLogged ?? '',
		isAnon: currentState.isAnon ?? true,
		rTopics: currentState.rTopics ?? [],
		cTopics: currentState.cTopics ?? []
	}));
}

export async function sharePage(urlToShare: string) {
	if (navigator && typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
	  let url = urlToShare;
	  try {
		await navigator.share({
		  url,
		});
		return true;
	  } catch (error) {
		console.error("Error :", error);
	  }
	} else {
		await navigator.clipboard.writeText(urlToShare);
		return true;
	}
  }