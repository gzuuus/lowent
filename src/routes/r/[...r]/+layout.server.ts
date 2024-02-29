import type { LoadParams } from '$lib/interfaces';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

export function load({ params }: LoadParams) {
	let { r } = params;
	r = r.trim() == '' ? 'Lowent-welcome' : r;
	const roomKey = bytesToHex(sha256(r));
	return {
		r: r,
		rK: roomKey
	};
}
