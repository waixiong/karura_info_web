import { ApiPromise, WsProvider } from '@polkadot/api';
import {
    options
} from "@acala-network/api";
import BN from 'bn.js';
import * as fetch from "node-fetch";

export function quantityToNumber(bn: BN): number {
    return bn.toNumber() / 1000000000000;
}

export function priceToNumber(bn: BN): number {
    return bn.div(new BN(1000000000000)).toNumber() / 1000000;
}

// // query with graphql format on subql-node
// // node: https://api.subquery.network/sq/AcalaNetwork/karura
// // node: https://api.polkawallet.io/karura-subql
// export async function subquery(
//     query, 
//     url = "https://api.subquery.network/sq/AcalaNetwork/karura"
// ) : Promise<fetch.Response> {
//     return fetch.default(url, query);
// }

export async function initAPI() : Promise<ApiPromise> {
    // const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    // const api = await ApiPromise.create({ provider: wsProvider });
    
    // TODO: set url in env
    const wsProvider = new WsProvider('wss://karura.api.onfinality.io/public-ws');
    const api = await ApiPromise.create(options({
        provider: wsProvider,
    }));
    return api;
}

export function startOfDay(date: Date) : Date {
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
}

export function endOfDay(date: Date) : Date {
    date.setUTCHours(23);
    date.setUTCMinutes(59);
    date.setUTCSeconds(59);
    date.setUTCMilliseconds(999);
    return date;
}