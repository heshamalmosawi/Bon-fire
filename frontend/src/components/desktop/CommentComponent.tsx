import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
import ToolTipWrapper from "../ToolTipWrapper";

const CommentComponent = () => {
  return (
    <div className="w-[570px] max-h-[540px] bg-black rounded-lg flex flex-col px-4 py-4 gap-4">
      {/* Reply */}
      <div className="w-full flex gap-2 border-b-[0.1px] border-b-[#3838386f] pt-4 pb-4">
        <Avatar>
          <AvatarImage src="https://images.pexels.com/photos/53114/horse-arabs-stallion-ride-53114.jpeg?auto=compress&cs=tinysrgb&w=600" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col w-full">
          <div className="flex gap-2 items-center">
            <h2 className="text-white font-bold">Commenter Name</h2>
            <h6 className="text-[#ffffff66]">@commenterUsername</h6>
            <h6 className="text-[#ffffff66]">| 2 Days Ago</h6>
          </div>
          <div className="text-white text-sm mt-1">
          Hmm very insightful!!!
          </div>
        </div>
      </div>

      {/* Original Post */}
      <div className="w-full flex flex-col gap-2  border border-[#3838386f] rounded-lg p-4">
        <div
          id="user-content"
          className="w-full h-[40px] flex items-center justify-start gap-2 p-1"
        >
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 items-center">
            <h2 className="text-white font-bold text-sm">Abdulrahman Idrees</h2>
            <h6 className="text-[#ffffff66] text-sm">@akhaled01</h6>
            <h6 className="text-[#ffffff66]">| 2 Days Ago</h6>
          </div>
        </div>
        <div
          id="post-content"
          className="w-full flex flex-col items-start justify-start gap-1 p-1"
        >
          <div id="post-text-content" className="text-white text-xs">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
            accusantium quidem sapiente dolorum velit exercitationem aliquam
            consectetur at repellendus! Soluta eius harum sunt nesciunt quibusdam
            voluptatem dolorum doloremque nisi sapiente!
          </div>
          <Image
            src={
              "https://dgnqdreynxmovfqozriv.supabase.co/storage/v1/object/public/main-bonfire-bucket/Screenshot%20from%202024-08-05%2011-40-40.png"
            }
            className="w-full h-[80px] rounded-lg" // Further reduced height for even smaller post image
            alt="post image"
            width={160}
            height={160}
          />
        </div>
      </div>
      <div className="w-full h-[44px] flex items-center justify-around gap-4  border-t-[0.1px] border-t-[#3838386f]">
        <ToolTipWrapper text="200 Likes">
          <Heart
            color="white"
            className="cursor-pointer hover:stroke-red-600 duration-300"
          />
        </ToolTipWrapper>
        <ToolTipWrapper text="190 comments">
          <MessageSquare
            color="white"
            className="cursor-pointer hover:stroke-amber-400 duration-300"
          />
        </ToolTipWrapper>
        <ToolTipWrapper text="wanna share?">
          <Forward
            color="white"
            className="cursor-pointer hover:stroke-green-500 duration-300"
          />
        </ToolTipWrapper>
      </div>
   
    </div>

    
  );
};

export default CommentComponent;
