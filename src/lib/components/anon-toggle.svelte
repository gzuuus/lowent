<script lang="ts">
	import { appSettings } from "$lib/stores/localStore";
	import { ndkUser } from "$lib/stores/provider";
	import { SlideToggle } from "@skeletonlabs/skeleton";
	export let mode: string | undefined = 'primary';
	const handleAnonToggle = () => {
		appSettings.update((state) => ({ ...state, isAnon: !state.isAnon }));
	};
	$: buttonClass =
		mode === 'inline'
			? 'inline-flex items-center gap-2'
			: mode === 'primary'
				? 'flex flex-col items-center'
				: mode === 'secondary'
					? 'common-btn-sm-ghost'
					: mode === 'drawer'
						? 'common-btn-filled justify-start w-full hover:text-current'
						: 'hidden';
</script>
<div class={buttonClass}>
    <span>{$appSettings.isAnon ? 'Anon' : $ndkUser?.profile?.name}</span>
    <SlideToggle name="slider-label" size="sm" bind:checked={$appSettings.isAnon} on:click={handleAnonToggle} />
</div>