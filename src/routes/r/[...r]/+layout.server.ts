import type { LoadParams } from "$lib/interfaces"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"

export function load({ params }: LoadParams) {
  const { r } = params
  const room = r ? r : "LowEnt"
  const roomKey = bytesToHex(sha256(room))
 	return {
     r: room,
     rK: roomKey
 	};
 }