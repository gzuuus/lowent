<script lang="ts">
    import { goto } from "$app/navigation";
    import { RadioGroup, RadioItem, focusTrap } from "@skeletonlabs/skeleton";
    export let searchDone: boolean = false;
    export let searchQuery: string = "";
    export let searchKind: string = "profile";
    export let isAdvancedSearch: boolean = false;
    function submitQuery() {
    if (searchQuery.trim() !== "") {
      searchQuery = searchQuery.toLowerCase().trim();
        if (searchKind == "hashtag") {
            goto(`/explore/${searchQuery}`);
        } else{
            goto(`/search/${searchQuery}`);
        }
    }
    searchDone = true
  }
  </script>
  <div class="input-group input-group-divider grid-cols-[1fr_auto]">
    <form 
      use:focusTrap={true}
      on:submit|preventDefault={submitQuery}
      >
        <input class="input" type="search" bind:value={searchQuery} placeholder="Search..." />
    </form>
    <button type="submit" class="variant-filled-secondary" on:click={submitQuery}>Search</button>
  </div>
  {#if isAdvancedSearch}
  <RadioGroup>
    <RadioItem bind:group={searchKind} name="justify" value="profile">profile</RadioItem>
    <RadioItem bind:group={searchKind} name="justify" value="hashtag">hashtag</RadioItem>
  </RadioGroup>
  {/if}