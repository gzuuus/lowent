<script>
	import { goto } from "$app/navigation";
	import { handleDeleteTopic } from "$lib/helpers";
	import CipherIcon from "$lib/icons/cipher-icon.svelte";
	import CloseIcon from "$lib/icons/close-icon.svelte";
	import GlobalIcon from "$lib/icons/global-icon.svelte";
	import { appSettings } from "$lib/stores/localStore";
</script>
{#if $appSettings.rTopics.length}
<span class=" inline-flex gap-2 items-center"><GlobalIcon size={16} /> Your rooms:</span>
{#each $appSettings.rTopics as topic}
    <div class="btn-group variant-soft grid grid-cols-[1fr_auto] w-full">
        <button
            class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap variant-soft"
            on:click={() => goto(`/r/${topic}`)}
        >
            {topic}
        </button>
        <button on:click={() => handleDeleteTopic(topic, 'r')}><CloseIcon size={16} /></button>
    </div>
{/each}
{/if}
{#if $appSettings.cTopics.length}
<span class=" inline-flex gap-2 items-center"><CipherIcon size={16} /> cipher rooms:</span>
{#each $appSettings.cTopics as topic}
    <div class="btn-group variant-soft grid grid-cols-[1fr_auto] w-full">
        <button
            class="btn p-2 w-full flex items-center space-x-1 whitespace-pre-wrap variant-soft"
            on:click={() => goto(`/c/${topic}`)}
        >
            {topic}
        </button>
        <button on:click={() => handleDeleteTopic(topic, 'c')}><CloseIcon size={16} /></button>
    </div>
{/each}
{/if}