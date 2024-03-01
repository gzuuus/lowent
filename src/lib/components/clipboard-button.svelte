<script lang="ts">
  export let contentToCopy: string;
  export let buttonIcon: string | undefined = "copy";
  export let buttonText: string | undefined = "";
  export let isButton: boolean = true;
  import { clipboard } from '@skeletonlabs/skeleton';
  import { sharePage } from '$lib/helpers';
	import LinkOut from '$lib/icons/link-out.svelte';
	import ShareIcon from '$lib/icons/share-icon.svelte';
  import CopyIcon from '$lib/icons/copy-icon.svelte';

  let copied = false;
  function onClickHandler(): void {
    buttonIcon == "share" ?? sharePage(contentToCopy);      
    
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1500);
  }
</script>
  <button 
    class= "{copied ? 
    isButton ? "btn btn-sm variant-ghost-success" : "flex gap-1" : 
    isButton ? "btn btn-sm variant-ghost w-fit" : "flex gap-1"
    }"
    use:clipboard={contentToCopy} 
    on:click={onClickHandler} 
    disabled={copied}
    >

    {#if copied}
      Copied!
    {:else}
    <span>{buttonText}</span> 
    {#if buttonIcon != "none"}
      {#if buttonIcon == "link"}
        <LinkOut size={16} />
      {:else if buttonIcon == "share"}
        <ShareIcon size={16} />
      {:else if buttonIcon == "copy"}
        <CopyIcon size={16} />
      {/if}
    {/if}
    {/if}
  </button>
