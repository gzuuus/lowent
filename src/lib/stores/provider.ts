import { writable } from 'svelte/store';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { browser } from '$app/environment';
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import type { NDKCacheAdapter, NDKUser } from '@nostr-dev-kit/ndk';
import { dbName } from './constants';
let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
	cacheAdapter = new NDKCacheAdapterDexie({
		dbName: dbName,
		expirationTime: 3600 * 24 * 1,
	});	
}

export const defaulRelaysUrls: string[] = [
	'wss://purplepag.es',
	'wss://bouncer.nostree.me',
	'wss://nos.lol'
];

const ndk = new NDKSvelte({
	explicitRelayUrls: defaulRelaysUrls,
	cacheAdapter,
	enableOutboxModel: false
});

ndk.connect().then(() => console.log('ndk connected successfully'));

const ndkStore = writable(ndk);
export const ndkUser = writable<NDKUser | undefined>(undefined);

export default ndkStore;
