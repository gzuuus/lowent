<script lang="ts">
	import { goto } from "$app/navigation";
	import { NDKlogin, handleDeleteTopic } from "$lib/helpers";
	import CloseIcon from "$lib/icons/close-icon.svelte";
	import GlobalIcon from "$lib/icons/global-icon.svelte";
	import HomeIcon from "$lib/icons/home-icon.svelte";
	import SearchIcon from "$lib/icons/search-icon.svelte";
	import ProfileIcon from "$lib/icons/profile-icon.svelte";
    import { appSetings } from "$lib/stores/localStore";

</script>
<div class=" flex flex-col gap-2">
<div>
    <button type="button" class="btn-icon btn-icon-sm variant-filled" on:click={() => goto('/')}>
        <HomeIcon size={16} />
    </button>
    <button type="button" class="btn-icon btn-icon-sm variant-filled" on:click={() => goto('/')}>
        <SearchIcon size={16} />
    </button>
    <button type="button" class="btn-icon btn-icon-sm variant-filled" on:click={() => NDKlogin()}>
        <ProfileIcon size={16} />
    </button>
</div>
<span class=" inline-flex gap-2 items-center"><GlobalIcon size={16} /> Global rooms:</span>
{#each $appSetings.rTopics as topic}
<div class="btn-group variant-soft grid grid-cols-[1fr_auto]">
    <button
     class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap variant-soft"
     on:click={() => goto(`/r/${topic}`)}
     >
        {topic}
    </button>
    <button on:click={() => handleDeleteTopic(topic)}><CloseIcon size={16} /></button>
</div>
{/each}
</div>