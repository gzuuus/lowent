import type { LoadParams } from '$lib/interfaces';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { nanoid } from 'nanoid';

export function load({ params }: LoadParams) {
	let { r } = params;
	r = r.trim() == '' ? nanoid(12) : r;
	const roomKey = bytesToHex(sha256(r));
	return {
		r: r,
		rK: roomKey
	};
}
