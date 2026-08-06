import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  type Citation,
} from "@aws-sdk/client-bedrock-agent-runtime";

const KB_ID = "CZIH7OWOAT";
const MODEL_ARN =
  "arn:aws:bedrock:us-east-1:821788677871:inference-profile/us.anthropic.claude-sonnet-4-5-20250929-v1:0";
const REGION = process.env.AWS_REGION ?? "us-east-1";

function getClient() {
  return new BedrockAgentRuntimeClient({
    region: REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          }
        : undefined, // falls back to IAM role / instance profile
  });
}

export interface ChatSource {
  title: string;
  uri: string;
}

export interface ChatResult {
  answer: string;
  sources: ChatSource[];
  sessionId: string;
}

function extractTitle(uri: string): string {
  const parts = uri.split("/");
  const file = parts[parts.length - 1] ?? "";
  return file
    .replace(/\.htm(l)?$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseCitations(citations: Citation[]): ChatSource[] {
  const seen = new Set<string>();
  const sources: ChatSource[] = [];
  for (const citation of citations) {
    for (const ref of citation.retrievedReferences ?? []) {
      const uri = ref.location?.s3Location?.uri ?? "";
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        sources.push({ title: extractTitle(uri), uri });
      }
    }
  }
  return sources;
}

export async function queryKnowledgeBase(
  message: string,
  sessionId?: string
): Promise<ChatResult> {
  const client = getClient();

  const command = new RetrieveAndGenerateCommand({
    input: { text: message },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: KB_ID,
        modelArn: MODEL_ARN,
        retrievalConfiguration: {
          vectorSearchConfiguration: { numberOfResults: 5 },
        },
      },
    },
    ...(sessionId ? { sessionId } : {}),
  });

  const response = await client.send(command);

  return {
    answer: response.output?.text ?? "I could not find an answer to that question.",
    sources: parseCitations(response.citations ?? []),
    sessionId: response.sessionId ?? "",
  };
}
