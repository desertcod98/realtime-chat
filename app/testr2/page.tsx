"use client";
import axios from "axios";
import { useForm } from "react-hook-form";

interface FormSubmitData {
  file: FileList;
}

export default function Testr2() {
  const {register, handleSubmit} = useForm<FormSubmitData>();

  async function onSubmit(data: FormSubmitData) {
    const {putUrl, key} = (await axios.put("/api/upload", {fileName: data.file[0].name})).data;
    await axios.put(putUrl, data.file[0]);
    console.log(process.env.NEXT_PUBLIC_R2_PROFILE+key);
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
