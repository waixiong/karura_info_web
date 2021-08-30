import { request, gql } from "graphql-request";

export async function lastBlockFromSubquery(
    url = 'https://api.subquery.network/sq/AcalaNetwork/karura'
) : Promise<number> {
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
                    }
                }
            }
        `
    );
    var obj: any = nodes[0];
    return Number.parseFloat(obj.number);
}
