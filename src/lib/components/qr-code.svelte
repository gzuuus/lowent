<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import QRcode from 'qrcode-generator';
	export let toQr: string;

	function generateQRCode(value: string) {
		let qr = QRcode(0, 'L');
		qr.addData(value);
		qr.make();
		return qr.createDataURL();
	}
</script>

<Avatar src={generateQRCode(toQr)} alt="qrcode" rounded="none" width=" w-36" />
