<script lang="ts">
    import PlusSmall from "$lib/icons/plus-small.svelte";
    import MinusSmall from "$lib/icons/minus-small.svelte";
    import LinkifyIt from "linkify-it";
    import MarkdownIt from "markdown-it";

    export let content: string;
    export let charLimit: number = 360;

    const md = new MarkdownIt();
    const linkify = new LinkifyIt();
  
    let parsedContent: string;
    let showMore: boolean = false;
  
    function parseLinks(rawContent: string): string {
      const matches = linkify.match(rawContent);
      if (matches) {
        for (const match of matches) {
          if (isImageLink(match.url)) {
            rawContent = rawContent.replace(match.text, `<a class=" bg-surface-600 p-1" href="${match.url}" target="_blank" rel="noopener noreferrer">This is an image, click to view<a/>`);
          } else if (isVideoLink(match.url)) {
            rawContent = rawContent.replace(
              match.text,
              `<video src="${match.url}" alt="${match.text}" controls></video>`
            );
          } else {
            rawContent = rawContent.replace(
              match.text,
              `<a href="${match.url}" target="_blank" rel="noopener noreferrer">${match.text}</a>`
            );
          }
        }
      }
      return rawContent;
    }
    function isImageLink(url: string): boolean {
      return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(url);
    }
    function isVideoLink(url: string): boolean {
      return /\.(mp4|mov|avi|wmv|flv|mkv|webm|mpeg|3gp|ogv)$/i.test(url);
    }
  
    $: {
        const rawContent = md.render(content);
        parsedContent = parseLinks(rawContent);
    }
  
    function toggleShowMore() {
      showMore = !showMore;
    }
  
    function getTruncatedContent() {
      return parsedContent.length > charLimit ? parsedContent.slice(0, charLimit) + "..." : parsedContent;
    }
  </script>
    {@html showMore ? parsedContent : getTruncatedContent()}
  
    {#if parsedContent.length > charLimit}
      <button class="common-btn-icon-ghost" on:click={toggleShowMore}>
        {#if showMore}
        <MinusSmall size={20} />
      {:else}
        <PlusSmall size={20} />
      {/if}
      </button>
    {/if}