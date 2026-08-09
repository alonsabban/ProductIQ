import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  type Citation,
} from "@aws-sdk/client-bedrock-agent-runtime";

const KB_ID = "CZIH7OWOAT";
const MODEL_ARN =
  "arn:aws:bedrock:us-east-1:821788677871:inference-profile/us.anthropic.claude-sonnet-4-5-20250929-v1:0";
const REGION = process.env.BEDROCK_REGION ?? "us-east-1";

function getClient() {
  return new BedrockAgentRuntimeClient({
    region: REGION,
    credentials:
      process.env.BEDROCK_ACCESS_KEY_ID && process.env.BEDROCK_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID,
            secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY,
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

function buildAnnotatedAnswer(
  answerText: string,
  citations: Citation[]
): { answer: string; sources: ChatSource[] } {
  const uriToIndex = new Map<string, number>();
  const sources: ChatSource[] = [];
  const endMap = new Map<number, Set<number>>();

  for (const citation of citations) {
    const span = citation.generatedResponsePart?.textResponsePart?.span;
    const indices: number[] = [];

    for (const ref of citation.retrievedReferences ?? []) {
      const uri = ref.location?.s3Location?.uri ?? "";
      if (!uri) continue;
      if (!uriToIndex.has(uri)) {
        uriToIndex.set(uri, sources.length);
        sources.push({ title: extractTitle(uri), uri });
      }
      const idx = uriToIndex.get(uri)!;
      if (!indices.includes(idx)) indices.push(idx);
    }

    if (span?.end !== undefined && indices.length > 0) {
      if (!endMap.has(span.end)) endMap.set(span.end, new Set());
      for (const idx of indices) endMap.get(span.end)!.add(idx);
    }
  }

  // Insert markers right-to-left so earlier offsets stay valid
  const positions = [...endMap.keys()].sort((a, b) => b - a);
  let answer = answerText;
  for (const pos of positions) {
    const marker = [...endMap.get(pos)!]
      .sort((a, b) => a - b)
      .map((i) => `[${i + 1}]`)
      .join("");
    answer = answer.slice(0, pos) + marker + answer.slice(pos);
  }

  return { answer, sources };
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

  const rawAnswer = response.output?.text ?? "I could not find an answer to that question.";
  const { answer, sources } = buildAnnotatedAnswer(rawAnswer, response.citations ?? []);

  return { answer, sources, sessionId: response.sessionId ?? "" };
}
