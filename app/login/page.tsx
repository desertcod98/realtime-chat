import Image from "next/image";
import AuthForm from "./components/AuthForm";
import Link from "next/link";

const Auth = () => {
  return (
    <div 
      className="
        flex 
        min-h-full 
        flex-col 
        justify-center 
        py-12 
        sm:px-6 
        lg:px-8 
        bg-gray-100
      "
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href={"/"}>
          <Image
            height="48"
            width="48"
            className="mx-auto w-auto"
            src="/vercel.svg"
            alt="Logo"
          />
        </Link>
        <h2 
          className="
            mt-6 
            text-center 
            text-3xl 
            font-bold 
            tracking-tight 
            text-gray-900
          "
          > 
            Sign in to your account
        </h2>
      </div>
      <AuthForm />      
  </div>
  )
}

export default Auth;
