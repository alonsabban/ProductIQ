import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = "productiq-unanswered-questions";
const REGION = process.env.BEDROCK_REGION ?? "us-east-1";

function getClient() {
  const raw = new DynamoDBClient({
    region: REGION,
    credentials:
      process.env.BEDROCK_ACCESS_KEY_ID && process.env.BEDROCK_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID,
            secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  return DynamoDBDocumentClient.from(raw);
}

export interface UnansweredQuestion {
  questionId: string;
  question: string;
  userId: string;
  timestamp: string;
  product: string | null;
  sessionId: string;
}

export async function logUnansweredQuestion(data: {
  question: string;
  userId: string;
  sessionId: string;
  product?: string | null;
}): Promise<void> {
  try {
    const client = getClient();
    await client.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          questionId: crypto.randomUUID(),
          question: data.question,
          userId: data.userId,
          timestamp: new Date().toISOString(),
          product: data.product ?? null,
          sessionId: data.sessionId,
        },
      })
    );
  } catch (err) {
    console.error("[unanswered-questions] Failed to log:", err);
  }
}

export async function listUnansweredQuestions(): Promise<UnansweredQuestion[]> {
  const client = getClient();
  const result = await client.send(new ScanCommand({ TableName: TABLE }));
  const items = (result.Items ?? []) as UnansweredQuestion[];
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
