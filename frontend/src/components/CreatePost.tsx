import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";

const CreatePost = () => {
  return (
    <Dialog>
      <DialogTrigger>
        {" "}
        <div className="cursor-pointer w-[570px] bg-black h-fit flex items-center justify-start gap-4 py-2 px-4 rounded-lg">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="text-[#ffffff66]">What's new?</h1>
        </div>
      </DialogTrigger>
      <DialogContent className="text-white bg-neutral-950 border-[#ffffff66] w-[870px] flex flex-col items-start justify-evenly">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="text-white font-bold">Abdulrahman Idrees</h4>
            <h6 className="text-[#ffffff66]">Public Post</h6>
          </div>
        </div>
        <Textarea className="bg-transparent border-0 h-52" placeholder="What's on your mind?"/>
        
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
