import type { UserSettings } from '$lib/interfaces';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export const appSettings: Writable<UserSettings> = localStorageStore('UserSettings', {
	lastUserLogged: undefined,
	isAnon: true,
	rTopics: [],
	cTopics: []
});
