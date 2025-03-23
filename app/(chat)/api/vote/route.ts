import { getChatById, getVotesByChatId, voteMessage } from '@/lib/db/queries';
import { PrivyClient } from '@privy-io/server-auth';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  let userId: string | null = null;

  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken!);
    if (!verifiedClaims || !verifiedClaims.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    userId = verifiedClaims.userId;
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  let userId: string | null = null;

  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken!);
    if (!verifiedClaims || !verifiedClaims.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    userId = verifiedClaims.userId;
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
