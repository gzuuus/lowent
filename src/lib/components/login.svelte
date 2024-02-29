<script lang="ts">
	export let mode: string | undefined = 'primary';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { logout, NDKlogin } from '$lib/helpers';
	import { ndkUser } from '$lib/stores/provider';
	import AnonToggle from './anon-toggle.svelte';
	import LogoutIcon from '$lib/icons/logout-icon.svelte';
	const modalStore = getModalStore();

	const modal: ModalSettings = {
		type: 'component',
		component: 'modalNoNip07'
	};
	async function login() {
		const login = await NDKlogin();
		if (!login) {
			modalStore.trigger(modal);
			console.log('Login error');
			return;
		}
	}

	$: buttonClass =
		mode === 'primary-sm'
			? 'common-btn-sm-filled'
			: mode === 'primary'
				? 'common-btn-filled'
				: mode === 'secondary'
					? 'common-btn-sm-ghost'
					: mode === 'drawer'
						? 'common-btn-filled justify-start w-full hover:text-current'
						: 'hidden';
</script>

{#if !$ndkUser}
	<button class={buttonClass} on:click={login}>Login</button>
{:else}
	<section class=" flex flex-row items-center gap-2">
		<span class=" opacity-70">Publishing as: </span><AnonToggle mode={'inline'} />
		<button type="button" class="btn-icon btn-icon-sm variant-ghost-error" on:click={logout}>
			<LogoutIcon size={16} />
		</button>
	</section>
{/if}
