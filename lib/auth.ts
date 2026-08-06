import { Amplify } from "aws-amplify";

export function configureAmplify() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;

  if (!userPoolId || !userPoolClientId) return;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: domain
          ? {
              oauth: {
                domain,
                scopes: ["openid", "email", "profile"],
                redirectSignIn: [`${origin}/`],
                redirectSignOut: [`${origin}/`],
                responseType: "code",
              },
            }
          : undefined,
      },
    },
  });
}

export const COGNITO_CONFIGURED =
  !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
  !!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

export function isOAuthCallback() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("error");
}
