<script lang="ts">
  export let userPub: string;
  import { fade } from "svelte/transition";
  import { fetchUserProfile } from "$lib/helpers";
  import { goto } from "$app/navigation";
	import BackIcon from "$lib/icons/back-icon.svelte";

</script>
  {#await fetchUserProfile(userPub) then value}
    <div transition:fade class="btn-group variant-soft grid grid-cols-[1fr_auto]">
      <button on:click={() => goto(`/r/${value?.website?.split("/").pop()}`)}>
        {value?.name}
      </button>
      <button on:click={() => goto(`/r/${value?.website?.split("/").pop()}`)}>
        <BackIcon size={16} flip={true} />
      </button>
    </div>
  {/await}
