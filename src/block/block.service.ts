import { Block } from "../dex";
import { request, gql } from "graphql-request";
import { SubqueryUrl } from '../config';

export async function lastBlockFromSubquery() : Promise<Block> {
    const {
        blocks: {
            nodes
        }
    } = await request(
        SubqueryUrl,
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
