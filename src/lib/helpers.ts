import { NDKEvent, NDKNip07Signer, type NDKUser, type NostrEvent } from "@nostr-dev-kit/ndk";
import { get as getStore } from "svelte/store";
import ndkStore, { ndkUser } from "$lib/stores/provider";
import { getEventHash, type Event, verifyEvent } from "nostr-tools";
import { appSetings } from "./stores/localStore";


export async function NDKlogin(): Promise<NDKUser | undefined> {
    console.log("NDKlogin");
    const $ndk = getStore(ndkStore);
    try {
      const signer = new NDKNip07Signer();
      $ndk.signer = signer;
      ndkStore.set($ndk);
      const ndkCurrentUser = await signer.user();
      let user = $ndk.getUser({
        npub: ndkCurrentUser.npub,
      });
      
    //   const followsSet = await user.follows();
    //   const followsArray = Array.from(followsSet as Set<NDKUser>);
    await user.fetchProfile();
    ndkUser.set(user);
    appSetings.update((currentState) => {
      return {
        lastUserLogged: ndkCurrentUser.pubkey,
        isAnon: false,
        rTopics: currentState.rTopics
      };
    })
    return user;
    // console.log(userProfile);
    //   await isNip05Valid(userProfile?.nip05, user.npub);
    //   const nip05ValidStore = getStore(isNip05ValidStore);
    //   localStore.update((currentState) => {
    //     return {
    //       lastUserLogged: ndkCurrentUser.npub,
    //       lastUserTheme: currentState.lastUserTheme,
    //       currentUserFollows: followsArray.map((user) => user.pubkey),
    //       UserIdentifier: nip05ValidStore.UserIdentifier,
    //     };
    //   });
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
    return eventHash
  };

  export async function finaliceEvent(ndkEvent: NDKEvent): Promise<NostrEvent> {
    let toEvent = await ndkEvent.toNostrEvent()
    let sigEvent = await ndkEvent.sign()
    toEvent.sig= sigEvent
    return toEvent
  };

  export function logout() {
    ndkUser.set(undefined);
    appSetings.update(() => {
      return {
        lastUserLogged: undefined,
        isAnon: true,
        rTopics: ['Music', 'General']
      };
    });
    // goto("/");
  }

  export function verifyAuthEvent ( event: NDKEvent, p?:string, e?: string, sig?: string): boolean {
    return verifyEvent({
      id: e!,
      pubkey: p!,
      created_at: event.created_at!,
      kind: event.kind!,
      tags: [],
      content: event.content,
      sig: sig!,
    })
  }