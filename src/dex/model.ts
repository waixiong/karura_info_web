// import BN from 'bn.js';

export interface RawEvent { 
    id: string; 
    method: string; 
    data: any[];
    blockNumber: number; 
    block: any;
}

// TODO: use gentype from acala
export class Block {
    id: string;
    timestamp: number;
    number: number;

    constructor(
        id?: string,
        timestamp?: number,
        number?: number
    ) {
        this.id = id || '';
        this.timestamp = timestamp || 0;
        this.number = number || 0;
    }

    public static fromJson(args: { id: string, timestamp: string, number: number }) {
        let result: Block = new Block(
            args.id,
            Date.parse(args.timestamp+'Z'),
            args.number,
        );
        return result;
    }
}

// TODO: use gentype from acala
export class SwapEvent {
    id: string | undefined;
    blockNumber: number | undefined;
    block: Block | undefined;
    // data
    currency: string[];
    amount: bigint[];
    startAmount: bigint;
    endAmount: bigint;

    constructor() {
        this.id = '';
        this.blockNumber = 0;
        this.currency = [];
        this.amount = [];
        this.startAmount = BigInt(0);
        this.endAmount = BigInt(0);
    }

    public static fromJson(obj: RawEvent) {
        let result: SwapEvent = new SwapEvent();
        result.id = obj.id;
        result.blockNumber = obj.blockNumber;
        result.block = Block.fromJson(obj.block as { id: string, timestamp: string, number: number });
        var swappingToken: { token: string }[]
        if (obj.data.length === 4) {
            // old structure: Swap(T::AccountId, Vec<CurrencyId>, Balance, Balance)
            swappingToken = JSON.parse(obj['data'][1]['value']);
            result.currency = [];
            for (var c of swappingToken) {
                result.currency.push(c.token);
            }
            result.startAmount = BigInt(obj['data'][2]['value']);
            result.endAmount = BigInt(obj['data'][3]['value']);
            result.amount = [ result.startAmount, result.endAmount ];
        } else {
            // new structure: Swap(T::AccountId, Vec<CurrencyId>, Vec<Balance>)
            // from commit 5afdb835eede2e0f417dff561167c26e81ddb571 @ AcalaNetwork/Acala 
            swappingToken = JSON.parse(obj['data'][1]['value']);
            result.currency = [];
            for (var c of swappingToken) {
                result.currency.push(c.token);
            }
            result.amount = [];
            var swappingAmount: any[] = JSON.parse(obj['data'][2]['value']);
            for (var a of swappingAmount) {
                result.amount.push(a);
            }
            // TODO: validate whether this is needed
            result.startAmount = result.amount[0];
            result.endAmount = result.amount[result.amount.length - 1];
        }
        return result;
    }
}

export class PoolData {
    pair: string; // in format of `{token0}-{token1}`
    rawSwaps: RawSwapAction[];
    volumeNative: number = 0;
    volumeUSD: number = 0;

    liquidityNative: number = 0;
    liquidityUSD: number = 0;
    
    date: string;
    lastBlockNumber: number;

    constructor(
        pair: string,
        rawSwaps: RawSwapAction[] = [],
    ) {
        this.pair = pair;
        this.rawSwaps = rawSwaps;

        this.date = '';
        this.lastBlockNumber = 0;
    }

    get token0(): string {
        return this.pair.split('-')[0];
    }

    get token1(): string {
        return this.pair.split('-')[1];
    }
}

// Raw data from SwapEvent with clear from which currency to which currency
export class RawSwapAction {
    id: string; // SwapEvent id
    blockNumber: number; // SwapEvent blockNumber
    block: Block; // SwapEvent Block
    // data
    fromCurrency: string;
    fromAmount: bigint;
    toCurrency: string;
    toAmount: bigint;

    constructor(raw: {
        id: string,
        blockNumber: number,
        block: Block,
        fromCurrency: string,
        fromAmount: bigint,
        toCurrency: string,
        toAmount: bigint,
    }) {
        this.id = raw.id;
        this.blockNumber = raw.blockNumber;
        this.block = raw.block;
        this.fromAmount = raw.fromAmount;
        this.fromCurrency = raw.fromCurrency;
        this.toAmount = raw.toAmount;
        this.toCurrency = raw.toCurrency;
    }
}

export class LiquidityPoolData {
    pair: string;
    data24h: PoolData;
    dataByDays: PoolData[];

    constructor(
        pair: string,
        data24h: PoolData,
        dataByDays: PoolData[],
    ) {
        this.pair = pair;
        this.data24h = data24h;
        this.dataByDays = dataByDays;
    }
}