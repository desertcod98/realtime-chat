"use client";

import { signOut } from "next-auth/react";

export default async function Home() {

  return (
    <div>
Home
    <button onClick={() => signOut()}>logout</button>
    </div>

  );
}
