import { useQuery } from 'react-query';
import { lastBlockFromSubquery } from './block.service';

export function LastBlockNumberQuery() {
    return useQuery("lastBlock", async () => {
        return (await lastBlockFromSubquery('https://api.polkawallet.io/karura-subql')).number;
    });
}

export function LastBlockQuery() {
    return useQuery("lastBlock", async () => {
        return lastBlockFromSubquery('https://api.polkawallet.io/karura-subql');
    });
}