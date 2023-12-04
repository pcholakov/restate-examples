import * as restate from "@restatedev/restate-sdk";
import {randomUUID} from "crypto";

//  -----------------                                         -----------------
//                         Idempotent DynamoDB update
//  -----------------                                         -----------------

// Data stores that support idempotent updates can be integrated very easily to
// achieve exactly-once semantics. This example demonstrates how we might do
// that with Amazon DynamoDB.

// In this example, we perform an idempotent insert into DynamoDB in a way that
// would be much harder with stateless compute alone. As long as the caller
// invokes Restate idempotently, the DynamoDB operation will be performed
// exactly once. How does Restate help? TODO.

// ----------------------------------------------------------------------------

interface PutItem {
    Put: {
        TableName: string;
        Item: object;
    }
}
interface UpdateItem {
    TableName: string;
    Item: object;
}
interface DeleteItem {
    TableName: string;
    key: object;
}

type DynamoDBOperation = PutItem | UpdateItem | DeleteItem;

// To avoid a dependency on the AWS SDK, we've defined a minimal interface that replicates the DynamoDB API.
interface DynamoDBClient {
    transactWriteItems(request: {
        clientRequestToken: string;
        items: DynamoDBOperation[];
    }): Promise<void>;
}

export async function idempotentInsert<RequestT>(ctx: restate.RpcContext, request: unknown, dynamoDb: DynamoDBClient): Promise<void> {
    const item = validateInput(request);

    const idempotencyToken = ctx.rand.uuidv4();

    // A restart of the Restate handler will re-try the DynamoDB operation with the same idempotency token, ensuring
    // that the commit only takes effect in DynamoDB once.
    await ctx.sideEffect(() => {
        return dynamoDb.transactWriteItems({
            clientRequestToken: idempotencyToken,
            items: [
                {
                    Put: {
                        TableName: "table",
                        Item: item,
                    },
                },
            ],
        });
    });

    return;
}

function validateInput(input: unknown): object {
    // perform validation on the raw input
    return input as object;
}