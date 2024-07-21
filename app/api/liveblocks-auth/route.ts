import { liveblocks } from '@/lib/liveblocks';
import { getUserColor } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in');
  }

  const { id, emailAddresses, firstName, lastName, imageUrl } = clerkUser;

  // Get the current user from your database
  const user = {
    id,
    info: {
      email: emailAddresses[0].emailAddress,
      name: `${firstName} ${lastName}`,
      avatar: imageUrl,
      color: getUserColor(id)
    }
  };

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(
    user.info.email,
    { userInfo: { id, ...user.info } } // Optional
  );

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  // session.allow(`${user.organization}:*`, session.READ_ACCESS);
  // session.allow(`${user.organization}:${user.group}:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
