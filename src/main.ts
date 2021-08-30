import { 
    volume24HQuery,
    volume7DQuery,
} from './dex';

import { quantityToNumber, endOfDay, initAPI, startOfDay } from './utils';

async function main() {
    await volume24HQuery();
    var mapData = await volume7DQuery();

    mapData.forEach((data, pair) => {
        console.log(pair);
        for (var d of data) {
            console.log(d.date);
            console.log(d.volumeNative);
        }
        console.log('\n');
    });
}

main();