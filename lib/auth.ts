import { Amplify } from "aws-amplify";

export function configureAmplify() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;

  if (!userPoolId || !userPoolClientId) return;

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
                redirectSignIn: [
                  typeof window !== "undefined"
                    ? `${window.location.origin}/`
                    : "http://localhost:3000/",
                ],
                redirectSignOut: [
                  typeof window !== "undefined"
                    ? `${window.location.origin}/`
                    : "http://localhost:3000/",
                ],
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
