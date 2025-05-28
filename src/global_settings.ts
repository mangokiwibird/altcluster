import { get_ipfs_id } from "./ipfs.js";

export const IPFS_NODE_ID = await get_ipfs_id() // todo: auto fetch from rpc client