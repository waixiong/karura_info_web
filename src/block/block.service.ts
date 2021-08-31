import { Block } from "../dex";
import { request, gql } from "graphql-request";

export async function lastBlockFromSubquery(
    url = 'https://api.subquery.network/sq/AcalaNetwork/karura'
) : Promise<Block> {
    const {
        blocks: {
            nodes
        }
    } = await request(
        url,
        gql`
            query {
                blocks (
                    orderBy: NUMBER_DESC
                    first: 1
                ) {
                    nodes {
                        id
                        number
                        timestamp
                    }
                }
            }
        `
    );
    var obj: any = nodes[0];
    // return obj;
    return Block.fromJson(obj)
}
