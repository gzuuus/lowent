<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import QrCode from '../qr-code.svelte';
	import CloseIcon from '$lib/icons/close-icon.svelte';
	import ClipboardButton from '../clipboard-button.svelte';

	export let parent: any;
	const modalStore = getModalStore();
</script>

{#if $modalStore[0]}
	<div class=" card p-4 flex flex-col gap-2 items-end break-all">
		<header class="common-2xl-header">
            <button type="button" class="btn-icon btn-icon-sm {parent.buttonNeutral}" on:click={parent.onClose}><CloseIcon size={18} /></button>    
		</header>
        <QrCode toQr={$modalStore[0].meta.toQr} />
		<section class="w-full">
			<ClipboardButton contentToCopy={$modalStore[0].meta.toQr} buttonIcon="copy" buttonText="Copy" isButton={true} />
			<ClipboardButton contentToCopy={$modalStore[0].meta.toQr} buttonIcon="share" buttonText="Share" isButton={true} />
		</section>
    </div>
{/if}