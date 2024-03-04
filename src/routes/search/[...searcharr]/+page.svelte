<script lang="ts">
    import SearchComponent from "$lib/components/search-component.svelte";
    import { page } from "$app/stores";
    import SearchBar from "$lib/components/search-bar.svelte";
  	import ExploreIcon from "$lib/icons/explore-icon.svelte";
    let isExplore: boolean = false;

</script>
<svelte:head>
  <title>Lowent - Search</title>
  <meta name="description" content="Search rooms" />
  <meta property="og:title" content="Lowent - Search"/>
  <meta property="og:description" content="Search rooms" />
</svelte:head>
<div class=" m-2">
  <h1 class="h3">Room search</h1>
  <p>
  You can try to find rooms by name, or topic.
  </p>
  <section class=" grid grid-cols-[1fr_auto] gap-1">
  <SearchBar />
  <button class="btn btn-sm {isExplore ? 'variant-filled-primary' : 'variant-soft-primary'}" on:click={() => isExplore = !isExplore}>{isExplore ? 'Explore' : ''} <ExploreIcon size={16}/></button>
  </section>
    <SearchComponent searchQuery={!isExplore ? $page.params.searcharr : ' '} />
</div>