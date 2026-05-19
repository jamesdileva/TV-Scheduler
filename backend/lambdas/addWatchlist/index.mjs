import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "tv-scheduler-watchlist";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    let { showId, showName } = body;

    if (!showId || !showName) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing showId or showName" }),
      };
    }

    // normalize type (VERY IMPORTANT for DynamoDB)
    showId = Number(showId);

    // duplicate check
    const existing = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "showId = :id",
        ExpressionAttributeValues: {
          ":id": showId,
        },
      })
    );

    if (existing.Items?.length > 0) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Already saved" }),
      };
    }

    const item = {
      showId,
      showName,
      savedAt: new Date().toISOString(),
    };

    // 🔥 THIS WAS MISSING (CRITICAL)
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Show saved", item }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Failed to save show",
        message: error.message,
      }),
    };
  }
};