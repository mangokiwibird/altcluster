export type NetworkTable = {
    [ipfs_id: string]: string
}

let table_hash = ""

export function get_network_table_hash(): string {
    return table_hash
}

export function set_network_table_hash(hash: string) {
    table_hash = hash
}