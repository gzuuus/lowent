<script lang="ts">
	export let mode: string | undefined = 'primary';
	// export let doGoto: boolean = true;
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	// import ProfileIcon from "$lib/elements/icons/profile-icon.svelte";
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { NDKlogin } from '$lib/helpers';
	//   import { localStore } from "$lib/stores/localStore";
	import { get } from 'svelte/store';

	// const modalStore = getModalStore();
	//   const modal: ModalSettings = {
	//       type: 'component',
	//       component: 'modalNoNip07',
	//   }
	async function login() {
		const login = await NDKlogin();
		if (!login) {
			console.log('Login error');
			return;
		}
		// if (doGoto) {
		//   const {UserIdentifier} = get(localStore)
		//   goto(`/${UserIdentifier ? UserIdentifier : login.npub}`);
		// }
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

<button class={buttonClass} on:click={login}>Login</button>
