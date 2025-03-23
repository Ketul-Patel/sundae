import { getChatsByUserId } from '@/lib/db/queries';
import { PrivyClient } from '@privy-io/server-auth';
import { stripPrivyDID } from '@/lib/utils';
export async function GET(request: Request) {
  const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  let userId: string | null = null;

  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken!);
    if (!verifiedClaims || !verifiedClaims.userId) {
      return Response.json('Unauthorized!', { status: 401 });
    }

    userId = stripPrivyDID(verifiedClaims.userId) || null;
  } catch (error) {
    console.log("error", error);
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: userId! });
  return Response.json(chats);
}
