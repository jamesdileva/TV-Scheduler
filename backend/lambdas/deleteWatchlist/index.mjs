import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "tv-scheduler-watchlist";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

export const handler = async (event) => {
  try {
    console.log("EVENT:", JSON.stringify(event, null, 2));

    const rawId =
      event.pathParameters?.showId ||
      event.pathParameters?.id ||
      event.queryStringParameters?.showId;

    if (!rawId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing showId",
          eventReceived: event.pathParameters,
        }),
      };
    }

    const showId = Number(rawId);

    if (isNaN(showId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid showId (not a number)",
          rawId,
        }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          showId,
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Deleted successfully", showId }),
    };
  } catch (err) {
    console.log("ERROR:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Delete failed",
        message: err.message,
      }),
    };
  }
};