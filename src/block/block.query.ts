import { useQuery } from 'react-query';
import { lastBlockFromSubquery } from './block.service';

export function LastBlockNumberQuery() {
    return useQuery("lastBlockNumber", async () => {
        return (await lastBlockFromSubquery()).number;
    }, {
        cacheTime: 60 * 1000,
        staleTime: 30 * 1000,
    });
}

export function LastBlockQuery() {
    return useQuery("lastBlock", async () => {
        return lastBlockFromSubquery();
    }, {
        cacheTime: 60 * 1000,
        staleTime: 30 * 1000,
    });
}