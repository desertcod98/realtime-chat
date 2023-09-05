"use client";


import logout from "@/public/assets/logout.svg"
import { signOut } from "next-auth/react";
import Image from 'next/image'

export default function LogoutButton(){
  return (
    <Image
      src={logout}
      alt="Logout button"
      width={35}
      height={35}
      className="cursor-pointer"
      onClick={() => signOut()}
    />
  )
}