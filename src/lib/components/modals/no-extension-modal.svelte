<script lang="ts">
	export let parent: any;
</script>

<div class="common-modal-base">
	<header class="text-2xl font-semibold">
		It looks like you don't have a nostr extension installed to log in.
	</header>
	<p>FYI: You do not need an extension to use this app, you can be completely anonymous.</p>
	<p>
		But if you still want to log in, don't worry. Try installing one of the ones below and try
		again.
	</p>
	<a
		href="https://getalby.com/"
		target="_blank"
		rel="noopener noreferrer"
		class="common-btn-sm-ghost">GetAlby</a
	>
	<a
		href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
		target="_blank"
		rel="noopener noreferrer"
		class="common-btn-sm-ghost">Nos2x (chrome)</a
	>
	<p>Also consider to read one of this guides if you want to learn more</p>
	<a
		href="https://habla.news/tony/1681492751274"
		target="_blank"
		rel="noopener noreferrer"
		class="common-btn-sm-ghost">Welcome to Nostr by Tony</a
	>
	<a
		href="https://nostr.how/en/what-is-nostr"
		target="_blank"
		rel="noopener noreferrer"
		class="common-btn-sm-ghost">Nostr.how - What is Nostr?</a
	>
	<footer class={parent.regionFooter}>
		<button class="btn {parent.buttonPositive}" on:click={parent.onClose}>Accept</button>
	</footer>
</div>
