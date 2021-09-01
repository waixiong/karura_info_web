import { 
    getSwapEventUntilDate, 
    separateSwapEventByDay,
    getSwapEventOnLast24h,
    transformRawSwapAction,
    categorizeSwapEventsToPool, 
    calculatePoolVolume,
    PoolData, 
    SwapEvent,
    liquidtyConfig, NATIVE,
    historyRateFromLiquidity,
    LiquidityPoolData,
} from '.';
import { lastBlockFromSubquery } from '../block';

import { quantityToNumber, endOfDay, initAPI, startOfDay } from '../utils';

export async function volume24HQuery() : Promise<Map<string, PoolData>> {
    // var time1 = new Date();
    // console.log(`START`);
    
    var swaps = await getSwapEventOnLast24h();
    // console.log(`${swaps.length} trade made on last 24 hours`);

    var [rawSwaps, skip] = transformRawSwapAction(swaps);
    // console.log(`\nskip ${skip} interswap\n`);
    var pools: Map<string, PoolData> = categorizeSwapEventsToPool(rawSwaps);
    pools.forEach((pool, pair) => {
        // console.log(`\t${pool.rawSwaps.length} trades in ${pair}`);
        calculatePoolVolume(pool);
        // console.log(`\t\tVolume(KSM): ${pool.volumeNative}`);
        // console.log(`\t\tFees(KSM): ${pool.volumeNative * 0.003} KSM`);
    });

    // var time2 = new Date();
    // console.log(`\nTime taken: ${time2.getTime() - time1.getTime()} ms`);
    return pools;
}

export async function volume7DQuery() : Promise<Map<string, PoolData[]>> {
    // var time1 = new Date();
    // console.log(`START`);

    const timestamp = (await lastBlockFromSubquery()).timestamp; // get last sync
    var date = startOfDay(new Date(timestamp));
    date.setUTCDate(date.getUTCDate() - 6);
    var swaps = await getSwapEventUntilDate(date);
    // console.log('DONE QUERY\n');
    
    var swapsByDay = separateSwapEventByDay(swaps);

    const poolData : Map<string, PoolData[]> = new Map();

    for (var swapsOfDay of swapsByDay) {
        // console.log(`${swapsOfDay.length} trade made on ${
        //     startOfDay(new Date(swapsOfDay[0].block!.timestamp)).toUTCString()
        // }`);

        // computing
        var [rawSwaps, _] = transformRawSwapAction(swapsOfDay);
        // console.log(`\nskip ${skip} interswap\n`);
        var pools: Map<string, PoolData> = categorizeSwapEventsToPool(rawSwaps);
        pools.forEach((pool, pair) => {
            if (!poolData.has(pair)) {
                poolData.set(pair, []);
            }
            // console.log(`\t${pool.rawSwaps.length} trades in ${pair}`);
            calculatePoolVolume(pool);
            // console.log(`\t\tVolume(KSM): ${pool.volumeNative}`);
            // console.log(`\t\tFees(KSM): ${pool.volumeNative * 0.003} KSM`);
            poolData.get(pair)?.push(pool);
        });
        // console.log('');
    }

    // var time2 = new Date();
    // console.log(`\nTime taken: ${time2.getTime() - time1.getTime()} ms`);
    return poolData;
}

export async function liquidityData() : Promise<LiquidityPoolData[]> {
    const data7d = await volume7DQuery();
    const data24h = await volume24HQuery();
    const liquidityData: LiquidityPoolData[] = [];
    
    data7d.forEach((data, pair) => {
        liquidityData.push(new LiquidityPoolData(
            pair,
            data24h.get(pair)?? new PoolData(pair),
            data?? []
        ));
    });

    return liquidityData;
}