"use client";

import Spinner from "@/app/components/Spinner";
import axios from "axios";
import clsx from "clsx";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import Dropzone from "react-dropzone";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { AiOutlineCloudUpload } from "react-icons/ai";

export default function UploadProfilePic({
  imgUrl,
  setImgUrl,
}: {
  imgUrl: string | undefined;
  setImgUrl: Dispatch<SetStateAction<string | undefined>>;
}) {
  const [dragHovering, setDragHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFile(files: File[]) {
    setIsLoading(true);
    const file = files[0];
    const { putUrl, key } = (
      await axios.put("/api/profile-pic", { fileName: file.name })
    ).data;
    await axios.put(putUrl, file);
    const imgUrl = process.env.NEXT_PUBLIC_R2_PROFILE + key;
    setIsLoading(false);
    setImgUrl(imgUrl);
  }

  return (
    <div className="flex justify-center w-full">
      {imgUrl ? (
        <div className="w-60 flex justify-center relative">
          <div
            className="absolute top-0 right-0 z-10 rounded-2xl border-2 cursor-pointer"
            onClick={() => setImgUrl(undefined)}
          >
            <Image
              src={"/assets/x.svg"}
              alt="Remove"
              width={40}
              height={40}
              className=""
            />
          </div>
          <div className="w-40 h-40 relative">
            <Image
              src={imgUrl}
              alt={"Profile image"}
              fill
              className="rounded-[50%] object-cover"
            />
          </div>
        </div>
      ) : isLoading ? (
        <Spinner />
      ) : (
        <Dropzone
          onDrop={handleFile}
          maxFiles={1}
          onDragOver={() => setDragHovering(true)}
          onDragLeave={() => setDragHovering(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div
                  className={clsx(
                    "w-full h-32 border-dotted border-4 cursor-pointer flex items-center rounded-2xl px-10 justify-between",
                    dragHovering && "bg-slate-500"
                  )}
                >
                  <span className="text">
                    Profile picture (optional) <br />
                    Drag and drop or click
                  </span>
                  <AiOutlineCloudUpload size={80} opacity={0.9} />
                </div>
              </div>
            </section>
          )}
        </Dropzone>
      )}
    </div>
  );
}
