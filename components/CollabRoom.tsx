'use client';

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense';
import Loader from './Loader';
import Header from './Header';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useClerk,
  UserButton
} from '@clerk/nextjs';
import { Editor } from './editor/Editor';
import ActiveCollaborators from './ActiveCollaborators';
import { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocument } from '@/lib/actions/room.actions';

const CollabRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType
}: CollaborativeRoomProps) => {
  const clerk = useClerk();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docTitle, setDocTitle] = useState(roomMetadata?.title);

  useEffect(() => {
    const handleClickOutside = async (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
      }

      await updateDocument(roomId, docTitle);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const containerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      setLoading(true);

      try {
        if (docTitle !== roomMetadata.title) {
          const updatedDoc = await updateDocument(roomId, docTitle);
          if (updatedDoc) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className='collaborative-room'>
          <Header>
            <div
              ref={containerRef}
              className='flex w-fit items-center justify-center gap-3'
            >
              {editing && !loading ? (
                <Input
                  type='text'
                  value={docTitle}
                  ref={inputRef}
                  placeholder='Enter title'
                  onChange={(e) => setDocTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing || loading}
                  className='document-title-input'
                />
              ) : (
                <>
                  <p className='document-title'>{docTitle}</p>
                </>
              )}

              {currentUserType === 'editor' && !editing && (
                <Image
                  src='/assets/icons/edit.svg'
                  alt='edit'
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)}
                  className='cursor-pointer'
                />
              )}

              {currentUserType !== 'editor' && !editing && (
                <p className='view-only-tag'>View Only</p>
              )}

              {loading && <p className='text-sm text-gray-400'>Saving...</p>}
            </div>
            <div className='flex w-full flex-1 justify-end gap-2 sm:gap-3'>
              <ActiveCollaborators />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          {clerk.loaded && (
            <Editor roomId={roomId} currentUserType={currentUserType} />
          )}
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollabRoom;
