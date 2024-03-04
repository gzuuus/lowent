<script lang="ts">
  export let searchQuery: string;
  import ndk from "$lib/stores/provider";
  import { NDKRelaySet, type NDKEvent, type NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
  import ProfileCardCompact from "$lib/components/profile-card-compact.svelte";
  import { onDestroy } from "svelte";
  import type { ExtendedBaseType, NDKEventStore } from "@nostr-dev-kit/ndk-svelte";

  let searchResults: NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined;
  let eventList: NDKEvent[] = [];
  let isSubscribed: boolean = false;
  const searchRelays: NDKRelaySet = new NDKRelaySet(new Set(), $ndk);
  searchRelays.addRelay(new NDKRelay("wss://relay.nostr.band"));
  searchRelays.addRelay(new NDKRelay("wss://search.nos.today"));
  searchRelays.addRelay(new NDKRelay("wss://nos.lol"));

  async function searchEvents() {
    try {
      const ndkFilter: NDKFilter = { kinds: [0], search: `lowent.xyz/r/${searchQuery}`, limit: 50 };
      searchResults = $ndk.storeSubscribe(ndkFilter, {closeOnEose: true, relaySet: searchRelays });
      eventList = [];
      isSubscribed = true;

      if (searchResults) {
        searchResults.onEose(() => {
          isSubscribed = false;
        });
      }
    } catch (error) {
      console.error("Error during search:", error);
    }
  }

  $: if (searchQuery) {
    searchEvents();
  }

  $: {
    if ($searchResults) {
      eventList = $searchResults
        .filter(event =>
          JSON.stringify(event.content)
            .toLocaleLowerCase()
            .includes(searchQuery.toLowerCase().trim())
        );
    }
  }

  onDestroy(() => {
    if (searchResults) searchResults.unsubscribe();
    isSubscribed = false;
  });
</script>
<div class=" w-full">
  <div class="flex flex-col gap-2">
  <hr/>
  {#if !eventList.length && !isSubscribed}
    <span class:hidden={searchQuery == ''}>No results 😅 </span>
    {:else}
    {#each eventList as event}
      <div>
        <ProfileCardCompact userPub={event.author.pubkey} />
      </div>
    {/each}
  {/if}
  </div>
</div>