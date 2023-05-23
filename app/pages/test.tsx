import React, { useEffect } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useUser } from "@auth0/nextjs-auth0/client";
import { api } from "@/src/utils/api";

export default function ProtectedPage() {
  const { user, error, isLoading } = useUser();
  const { mutateAsync: getCurrUser } = api.users.currentUser.useMutation();

  return (
    <div>
      <h1>Protected Page</h1>

      {isLoading && <p>Loading profile...</p>}

      {error && (
        <>
          <h4>Error</h4>
          <pre>{error.message}</pre>
        </>
      )}

      {user && (
        <>
          <h4>Profile</h4>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button
            onClick={() => {
              getCurrUser();
            }}
          >
            Test
          </button>
        </>
      )}
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
