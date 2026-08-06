import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@aws-sdk/client-bedrock-agent-runtime"],
  env: {
    BEDROCK_REGION: process.env.BEDROCK_REGION ?? "us-east-1",
    BEDROCK_ACCESS_KEY_ID: process.env.BEDROCK_ACCESS_KEY_ID ?? "",
    BEDROCK_SECRET_ACCESS_KEY: process.env.BEDROCK_SECRET_ACCESS_KEY ?? "",
  },
};

export default nextConfig;
