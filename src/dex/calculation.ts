import { querySwap, querySwapFromBlock, historyRateFromLiquidity } from './data';
import { PoolData, SwapEvent, RawSwapAction } from './model';
import { endOfDay, startOfDay } from '../utils';
import { liquidtyConfig, NATIVE } from './config';
import { lastBlockFromSubquery } from '../block';
import { ApiPromise } from '@polkadot/api';
// import BN from 'bn.js';
// import * as fs from 'fs';

/// ASSUMPTION:
/// 1 block is 12000 ms
/// 1 day is 7200 blocks, may put 7300 for query excess data

export async function getSwapEventOnLast24h() : Promise<SwapEvent[]> {
    // Start of day, set at UTC 00:00:00.000
    var date: Date = new Date();
    date.setHours(date.getHours() - 24);
    var fromBlockEstimate = (await lastBlockFromSubquery()).number - 7300;

    // first query, expected only need one query
    var swapEvents = await querySwapFromBlock(fromBlockEstimate, 'https://api.polkawallet.io/karura-subql');
    
    // repeat query until reach more than 24h
    var reach24h: boolean = swapEvents[swapEvents.length-1].block!.timestamp > date.getTime();
    while(reach24h) {
        var swapEvents2 = await querySwap(100, swapEvents.length, 'https://api.polkawallet.io/karura-subql');
        swapEvents.push(...swapEvents2);
        reach24h = swapEvents[swapEvents.length-1].block!.timestamp > date.getTime();
    }

    // Cut the list to only within 24h
    for (var i = swapEvents.length - 1; i >= 0; i--) {
        if(swapEvents[i].block!.timestamp < date.getTime()) {
            swapEvents.pop();
        } else {
            break;
        }
    }

    return swapEvents;
}

export async function getSwapEventUntilDate(date?: Date) : Promise<SwapEvent[]> {
    // Start of day, set at UTC 00:00:00.000
    if (date == null) {
        // default as a week (6 days + today) 
        date = startOfDay(new Date());
        date.setUTCDate(date.getUTCDate() - 6);
    }

    // get block number from, with the milliseconds different, plus 100 as extra
    var millisecondsDifferent = ((new Date()).getTime() - date.getTime());
    var fromBlockEstimate = (await lastBlockFromSubquery()).number - (millisecondsDifferent / 12000 + 100);

    // first query, expected only need one query
    var swapEvents = await querySwapFromBlock(fromBlockEstimate, 'https://api.polkawallet.io/karura-subql');
    
    // repeat query until reach more than date
    var reachDate: boolean = swapEvents[swapEvents.length-1].block!.timestamp > date.getTime();
    while(reachDate) {
        var swapEvents2 = await querySwap(100, swapEvents.length, 'https://api.polkawallet.io/karura-subql');
        swapEvents.push(...swapEvents2);
        reachDate = swapEvents[swapEvents.length-1].block!.timestamp > date.getTime();
    }

    // Cut the list to only within date
    for (var i = swapEvents.length - 1; i >= 0; i--) {
        if(swapEvents[i].block!.timestamp < date.getTime()) {
            swapEvents.pop();
        } else {
            break;
        }
    }

    return swapEvents;
}

export function separateSwapEventByDay(swaps: SwapEvent[]) : SwapEvent[][] {
    var swapsWithDays: SwapEvent[][] = [[]];
    var endOfToday = endOfDay(new Date(swaps[swaps.length-1].block!.timestamp)).getTime();
    while (swaps.length > 0) {
        var swap = swaps.pop()!;
        if (swap.block!.timestamp > endOfToday) {
            swapsWithDays.push([]);
            endOfToday = endOfDay(new Date(swap.block!.timestamp)).getTime();
        }
        swapsWithDays[swapsWithDays.length-1].push(swap);
    }

    return swapsWithDays;
}

// // only for swap before block 408594
// export async function handlingSwapEventInterswap(swaps: SwapEvent[], api: ApiPromise) : Promise<void> {
//     var logs: string[] = [];
//     for (var swap of swaps) {
//         // handle interswap
//         if (swap.currency.length === swap.amount.length) {
//             continue;
//         }
//         // ROUGH-CALCULATION
//         for (var i = 0; i < swap.currency.length - 2; i++) {
//             var fromSymbol = swap.currency[i];
//             var toSymbol = swap.currency[i+1];
//             // rate of fromSymbol to 1 toSymbol
//             // TODO: inprove calculation
//             var rate = await historyRateFromLiquidity(swap.blockNumber-1, api, fromSymbol, toSymbol);
//             // amount * 0.997 / rate
//             var amount = swap.amount[i] * BigInt('997000000000000000') / rate;
//             swap.amount.splice(i+1, 0, amount);
//         }
//         // prepare logs
//         logs.push(JSON.stringify(swap, null, "\t"));
//     }
// }

// break complex swap event into raw swap action
// must be called after handlingInterswap or else will skip complex swapping
export function transformRawSwapAction(swaps: SwapEvent[]) : [ RawSwapAction[], number ] {
    var rawSwaps: RawSwapAction[] = [];
    var skip: number = 0;
    for (var swap of swaps) {
        if (swap.currency.length > 2 && swap.amount.length === 2) {
            // skip inter-swap amount as handlingInterswap not called
            // TODO: emit warning
            skip++;
            continue;
        }
        for (var i = 0; i < swap.currency.length - 1; i++) {
            var rawSwap: RawSwapAction = new RawSwapAction({
                id: swap.id!,
                block: swap.block!,
                blockNumber: swap.blockNumber!,
                fromCurrency: swap.currency[i],
                toCurrency: swap.currency[i+1],
                fromAmount: swap.amount[i],
                toAmount: swap.amount[i+1],
            });
            rawSwaps.push(rawSwap);
        }
    }

    return [rawSwaps, skip];
}

export function categorizeSwapEventsToPool(swaps: RawSwapAction[]): Map<string, PoolData> {
    var poolMap: Map<string, PoolData> = new Map();
    for (var swap of swaps) {
        var pair = liquidtyConfig[swap.fromCurrency][swap.toCurrency];
        if (!poolMap.has(pair)) {
            poolMap.set(pair, new PoolData(pair));
        }
        poolMap.get(pair)!.rawSwaps.push(swap);
    }
    poolMap.forEach((pool, _) => {
        pool.date = startOfDay(new Date(swaps[0].block.timestamp)).toUTCString();
        // TODO: get accurate last block of the days
        pool.lastBlockNumber = swaps[0].blockNumber;
    });
    return poolMap;
}

export function calculatePoolVolume(pool: PoolData) {
    for (var swap of pool.rawSwaps) {
        if (pool.token0 === NATIVE || pool.token1 === NATIVE) {
            if (swap.fromCurrency === NATIVE) {
                var nativeTraded = Number(swap.fromAmount) / 1000000000000;
                pool.volumeNative += nativeTraded;
            } else {
                var nativeTraded = (Number(swap.toAmount) / 1000000000000) / 0.997;
                pool.volumeNative += nativeTraded;
            }
        } else {
            // TODO: calculation on none NATIVE
        }
    }
}