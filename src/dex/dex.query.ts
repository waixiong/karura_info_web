import { useQuery } from 'react-query';
import { liquidityData } from '.';
import { volume24HQuery, volume7DQuery } from './dex.service';

export function Volume7DayQuery() {
    return useQuery("volume7d", async () => {
        return volume7DQuery();
    });
}

export function Volume24HQuery() {
    return useQuery("volume24h", async () => {
        return volume24HQuery();
    });
}

export function LiquidityDataQuery() {
    return useQuery("liquidityData", async () => {
        return liquidityData();
    });
}