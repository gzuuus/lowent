<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { announceTopic } from '$lib/helpers';

	export let parent: any;
    let allowJoinInput: boolean = false;
    let isCustomName: boolean = false;
    let customName: string = '';
	const modalStore = getModalStore();
	const toastStore = getToastStore();

	async function onFormSubmit(): Promise<void> {
		try {
            await announceTopic($modalStore[0].meta.roomParams, customName ? customName : $modalStore[0].meta.roomParams.r, allowJoinInput ? $modalStore[0].meta.allowJoin : '');
            toastStore.trigger({
                message: 'Room announced successfully',
                background: 'variant-filled-success',
                autohide: true,
                timeout: 2000
            });
            modalStore.close();
        } catch (error) {
            console.error(error);
            toastStore.trigger({
                message: 'Failed to announce room',
                background: 'variant-filled-error',
                autohide: true,
                timeout: 2000
            });
            modalStore.close();
        }
	}
</script>

{#if $modalStore[0]}
	<div class="common-modal-base">
		<header class="common-2xl-header">Announce room sets metadata for the room and allows others to find and join the room.</header>
		<p>Room name/alias: {!isCustomName ? $modalStore[0].meta.roomParams.r : customName}</p>
        <p>{allowJoinInput ? `Link to join: ${$modalStore[0].meta.allowJoin }`: ''}</p>
        <form on:submit|preventDefault={onFormSubmit} class="border border-surface-500 p-6 space-y-4 rounded-container-token">
			<label class="label break-words">
                {#if isCustomName}
                    <span>Custom name</span>
                    <input class="input" bind:value={customName} placeholder="Enter some text..." />
                {/if}
                <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                        <input class="checkbox" type="checkbox" bind:checked={isCustomName} />
                        <p>Set a custom name/alias</p>
                    </label>
                    <label class="flex items-center space-x-2">
                        <input class="checkbox" type="checkbox" bind:checked={allowJoinInput} />
                        <p>Allow other people to join</p>
                    </label>
                    <p class=" opacity-40">This will add the connection link to the public metadata of the room</p>
                </div>
            </label>
			<footer class="modal-footer {parent.regionFooter}">
				<button type="button" class="btn variant-filled-primary" on:click={onFormSubmit}>Announce</button>

                <button type="button" class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
				</footer>
		</form>


	</div>
{/if}