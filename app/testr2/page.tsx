"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import https from "https";

interface FormSubmitData {
  file: FileList;
}

export default function Testr2() {
  const {register, handleSubmit} = useForm<FormSubmitData>();

  async function onSubmit(data: FormSubmitData) {
    const putUrl : string = (await axios.put("/api/upload", {fileName: data.file[0].name})).data.putUrl;
    await axios.put(putUrl, data.file[0]);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <input type="file" id="file" {...register("file")} required />
        <button type="submit">submit</button>
      </form>
    </>
  );
}
