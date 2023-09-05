"use client";

import { Input } from "@/components/ui/input";
import upload from "@/public/assets/upload.svg";
import Image from "next/image";
import { useState } from "react";
import Dropzone from "react-dropzone";

export default function AddMessageAttachments({
  addFiles,
}: {
  addFiles: (files: File[]) => void;
}) {
  const [dragHovering, setDragHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleFiles(newFiles: File[]) {
    addFiles(newFiles);
  }

  return (
    <>
      <Dropzone
        onDrop={handleFiles}
        onDragOver={() => setDragHovering(true)}
        onDragLeave={() => setDragHovering(false)}
      >
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Image
                src={upload}
                alt="Upload message attachment"
                width={30}
                height={30}
                className="cursor-pointer"
              ></Image>
            </div>
          </section>
        )}
      </Dropzone>

      {/* <input
        type="file"
        id="images"
        accept="image/*" //TODO accept all files
        multiple
      /> */}
    </>
  );
}
