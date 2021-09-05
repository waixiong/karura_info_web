import { Dispatch, SetStateAction } from 'react';
import { useQuery } from 'react-query';
import { categorizeSwapEventsToPool, liquidityData, querySwapFromBlock, transformRawSwapAction } from '.';
import { startOfDay } from '../utils';
import { volume24HQuery, volume7DQuery } from './dex.service';
import { DexStateInterface } from './dex.state';
import { computeLiquidityPoolData } from './liquidity.calculation';

const ONE_BLOCK_TIME = 12000; // ms

// export function Volume7DayQuery() {
// 	return useQuery("volume7d", async () => {
// 		return volume7DQuery();
// 	});
// }

// export function Volume24HQuery() {
// 	return useQuery("volume24h", async () => {
// 		return volume24HQuery();
// 	});
// }

export function LiquidityDataQuery() {
	return useQuery("liquidityData", async () => {
		return liquidityData();
	});
}

export async function querySwapUpdate(
	toBlock: number, 
	state: DexStateInterface, 
	dispatch: Dispatch<SetStateAction<Partial<DexStateInterface>>>
) {
	var fromBlock = state.lastBlock;
	var swapEvents = await querySwapFromBlock(fromBlock, toBlock);
	var [rawSwapActions, _] = transformRawSwapAction(swapEvents);

	console.log(`\t\tupdate: ${state.lastBlock} -> ${toBlock}`);
	rawSwapActions.push(...state.swap);
	console.log(`\t\tswap count: ${rawSwapActions.length}`);
	
	// TODO: insert rawSwapActions
	var data = computeLiquidityPoolData([...rawSwapActions]);
	dispatch({
	  lastBlock: toBlock,
	  swap: rawSwapActions,
		data: data,
		loaded7d: state.loaded7d,
	})
}

export const querySwapData = (
	lastBlock: number, 
	dispatch: Dispatch<SetStateAction<Partial<DexStateInterface>>>
) => {
	query24hSwapData(lastBlock, dispatch);
}

async function query24hSwapData(lastBlock: number, dispatch: Dispatch<SetStateAction<Partial<DexStateInterface>>>) {
	var state: Partial<DexStateInterface> = {
		lastBlock: lastBlock,
	}
	// dispatch(state);

	var date: Date = new Date();
	date.setHours(date.getHours() - 24);
	var fromBlockEstimate = lastBlock - 7300;

	// first query, expected only need one query
	var swapEvents = await querySwapFromBlock(fromBlockEstimate);
	var [rawSwapActions, _] = transformRawSwapAction(swapEvents);

	var untilBlock = rawSwapActions[rawSwapActions.length - 1].blockNumber - 1;
	state.swap = rawSwapActions;
	console.log(`\t\t24h swap count: ${rawSwapActions.length}`);

	state.data = computeLiquidityPoolData([...rawSwapActions]);
	state.loaded7d = false;
	dispatch(state);

	queryUntil7dSwapData(untilBlock, state as DexStateInterface, dispatch);
}

// TODO: should be replaced by better algo
// continueBlock: block query until at query24hSwapData, will continue from the block
async function queryUntil7dSwapData(continueBlock: number, state: DexStateInterface, dispatch: Dispatch<SetStateAction<Partial<DexStateInterface>>>) {
	// one week ago
	var date = startOfDay(new Date());
	date.setUTCDate(date.getUTCDate() - 6);

	// get block number from, with the milliseconds different, plus 600 as extra
	var millisecondsDifferent = ((new Date()).getTime() - date.getTime());
	var fromBlockEstimate = continueBlock - (millisecondsDifferent / ONE_BLOCK_TIME + 300);

	// first query, expected only need one query
	var swapEvents = await querySwapFromBlock(fromBlockEstimate, continueBlock);

	// Cut the list to only within date
	for (var i = swapEvents.length - 1; i >= 0; i--) {
		if(swapEvents[i].block!.timestamp < date.getTime()) {
			swapEvents.pop();
		} else {
			break;
		}
	}

	var [rawSwapActions, _] = transformRawSwapAction(swapEvents);

	// TODO: insert rawSwapActions
	state.swap.push(...rawSwapActions);
	state.data = computeLiquidityPoolData([...state.swap]);
	state.loaded7d = true;
	console.log(`\t\t7d swap count: ${state.swap.length}`);

	dispatch(state);
}