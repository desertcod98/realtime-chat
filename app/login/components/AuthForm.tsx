"use client";
import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub } from "@react-icons/all-files/bs/BsGithub";
import { BsGoogle } from "@react-icons/all-files/bs/BsGoogle";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UploadProfilePic from "./UploadProfilePic";

enum Variant {
  Login,
  Register,
}

export default function AuthForm() {
  const session = useSession();
  const [variant, setVariant] = useState<Variant>(Variant.Login);
  const [isLoading, setIsLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === Variant.Login) {
      setVariant(Variant.Register);
    } else {
      setVariant(Variant.Login);
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if(imgUrl){
      data.imgUrl = imgUrl;
    }
    setIsLoading(true);
    if (variant === Variant.Register) {
      fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (res.status != 200) {
            res.text().then((error) => toast.error(error));
          } else {
            signIn("credentials", data);
            toast.success("Success");
          }
        })
        .catch(() => toast.error("Something went wrong!"))
        .finally(() => setIsLoading(false));
    } else {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials");
          } else if (callback?.ok) {
            router.push("/");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const socialAction = (action: string) => {
    signIn(action, {
      redirect: false,
    })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        } else if (callback?.ok) {
          toast.success("Success");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="
        mt-8
        sm:mx-auto
        sm:w-full
        sm:max-w-md
      "
    >
      <div
        className="
            bg-white
            px-4
            py-8
            shadow
            sm:rounded-lg
            sm:px-10    
          "
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === Variant.Register && (
            <Input id="name" label="Name" register={register} errors={errors} />
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            register={register}
            errors={errors}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            register={register}
            errors={errors}
          />
          {variant === Variant.Register && (
            <UploadProfilePic imgUrl={imgUrl} setImgUrl={setImgUrl}/>
          )}
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === Variant.Login ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div
              className="
                relative 
                flex 
                justify-center
                text-sm
              "
            >
              <span
                className="
                bg-white
                px-2
                text-gray-500
              "
              >
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>
        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          "
        >
          <div>
            {variant === Variant.Login
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === Variant.Login ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
}
