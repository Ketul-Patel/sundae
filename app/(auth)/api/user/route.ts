import { createUser, getUser } from '@/lib/db/queries';
import { stripPrivyDID } from '@/lib/utils';
import { PrivyClient } from '@privy-io/server-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  let userId: string | null = null;

  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken!);
    if (!verifiedClaims || !verifiedClaims.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    userId = stripPrivyDID(verifiedClaims.userId) || null;
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await getUser(userId!);

  return new Response(JSON.stringify(user), { status: 200 });
}

export async function POST(request: Request) {
  const { id, email, walletAddress } = await request.json();

  console.log("we're adding a user", id, email, walletAddress);

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  
//   const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

//   const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

//   let userId: string | null = null;

//   try {
//     const verifiedClaims = await privy.verifyAuthToken(accessToken!);
//     if (!verifiedClaims || !verifiedClaims.userId) {
//       return new Response('Unauthorized', { status: 401 });
//     }

//     userId = stripPrivyDID(verifiedClaims.userId) || null;
//   } catch (error) {
//     return new Response('Unauthorized', { status: 401 });
//   }

  const existingUser = await getUser(id!);

  if (existingUser.length > 0) {
    return new Response(JSON.stringify(existingUser), { status: 200 });
  }

  const user = await createUser(id!, email, walletAddress);

  return new Response(JSON.stringify(user), { status: 200 });
}   