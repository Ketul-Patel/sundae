import { ArtifactKind } from '@/components/artifact';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries';
import { PrivyClient } from '@privy-io/server-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
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

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (!document) {
    return new Response('Not Found', { status: 404 });
  }

  if (document.userId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
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

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  if (userId) {
    const document = await saveDocument({
      id,
      content,
      title,
      kind,
      userId: userId,
    });

    return Response.json(document, { status: 200 });
  }

  return new Response('Unauthorized', { status: 401 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response('Missing id', { status: 400 });
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

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (document.userId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
}
