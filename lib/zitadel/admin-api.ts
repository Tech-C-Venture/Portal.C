/**
 * ZITADEL Admin API client for user management.
 * Uses a service user PAT to authenticate against the ZITADEL Management API.
 */

interface CreateUserResponse {
  userId: string;
  details?: {
    sequence: number;
    changeDate: string;
    resourceOwner: string;
  };
}

interface ZitadelErrorDetail {
  message?: string;
}

interface ZitadelErrorResponse {
  code?: number;
  message?: string;
  details?: ZitadelErrorDetail[];
}

function getConfig() {
  const issuer = process.env.ZITADEL_ISSUER;
  const pat = process.env.ZITADEL_SERVICE_USER_PAT;
  const projectId = process.env.ZITADEL_PROJECT_ID;

  if (!issuer) throw new Error("ZITADEL_ISSUER is not set");
  if (!pat) throw new Error("ZITADEL_SERVICE_USER_PAT is not set");
  if (!projectId) throw new Error("ZITADEL_PROJECT_ID is not set");

  return { issuer, pat, projectId };
}

export async function createZitadelUser(
  givenName: string,
  familyName: string,
  email: string,
  username: string
): Promise<{ userId: string }> {
  const { issuer, pat } = getConfig();

  const response = await fetch(`${issuer}/management/v1/users/human`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pat}`,
    },
    body: JSON.stringify({
      userName: username,
      profile: {
        firstName: givenName,
        lastName: familyName,
      },
      email: {
        email,
        isEmailVerified: false,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ZitadelErrorResponse | null;
    const message = errorBody?.message ?? `ZITADEL API error: ${response.status}`;
    throw new Error(message);
  }

  const data = (await response.json()) as CreateUserResponse;
  return { userId: data.userId };
}

export async function assignUserGrant(
  userId: string,
  roleKeys: string[]
): Promise<void> {
  const { issuer, pat, projectId } = getConfig();

  const response = await fetch(
    `${issuer}/management/v1/users/${userId}/grants`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pat}`,
      },
      body: JSON.stringify({
        projectId,
        roleKeys,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ZitadelErrorResponse | null;
    const message = errorBody?.message ?? `Role assignment failed: ${response.status}`;
    throw new Error(message);
  }
}
