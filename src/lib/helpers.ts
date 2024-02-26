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
				rTopics: currentState.rTopics
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
			rTopics: currentState.rTopics
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

export function handleDeleteTopic(topic: string): void {
	let $appSettings = get(appSettings);
	let $page = get(page);
	appSettings.update((currentState) => {
		return {
			lastUserLogged: currentState.lastUserLogged,
			isAnon: currentState.isAnon,
			rTopics: currentState.rTopics.filter((value) => value !== topic)
		};
	});
	console.log($appSettings.rTopics);
	if ($appSettings.rTopics.length == 0) {
		goto('/');
	} else goto(`/${$page.route.id?.split('/')[1]}/${$appSettings.rTopics[0]}`);
}

export async function announceTopic(publicKey: string, publicName: string, secretKey: string) {
	// TODO add tag to fetch and discover
	const ndk = get(ndkStore);
	const topic = ndk.getUser({ pubkey: publicKey });
	await topic.fetchProfile();
	topic.profile!.name = publicName;
	topic.profile!.about = `Topic: ${publicName}`;
	const signer = new NDKPrivateKeySigner(secretKey);
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
		})
		return true;
    } catch (error) {
		console.error(error);
		return false;
	}
  }
