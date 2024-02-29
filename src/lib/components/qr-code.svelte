<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import QRcode from 'qrcode-generator';
	export let toQr: string;

	function generateQRCode(value: string) {
		let qr = QRcode(0, 'L');
		qr.addData(value);
		qr.make();
		return qr.createSvgTag(8);
	}
</script>
{@html generateQRCode(toQr)}
