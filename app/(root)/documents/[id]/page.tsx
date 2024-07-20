import { Editor } from '@/components/editor/Editor';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Header from '@/components/Header';

const Document = () => {
  return (
    <div>
      <Header>
        <div className='flex w-fit items-center justify-center gap-3'>
          <p className='document-title'>Share</p>
        </div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Header>
      <Editor />
    </div>
  );
};

export default Document;
