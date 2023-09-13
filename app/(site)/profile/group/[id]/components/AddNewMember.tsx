"use client";

import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import NewMemberModal from "./NewMemberModal";

export default function AddNewMember({chatId} : {chatId: string}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div
        className="bg-slate-200 cursor-pointer select-none hover:bg-slate-300 w-full h-full"
        onClick={() => setDialogOpen(true)}
      >
        <div className="w-full h-20 flex items-center p-2 gap-14">
          <AiOutlinePlus size={50} />
          <span className="text-xl">Add new member</span>
        </div>
        <Separator className="mb-2" />
      </div>
      <NewMemberModal
        open={dialogOpen}
        setIsOpen={(open) => {
          setDialogOpen(open);
        }}
        chatId={chatId}
      />
    </>
  );
}
