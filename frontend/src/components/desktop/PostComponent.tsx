import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";

const PostComponent = () => {
  return (
    <div className="w-[570px] max-h-[540px] bg-black rounded-lg flex flex-col items-center justify-center px-4 py-10 gap-4">
      <div
        id="user-content"
        className="w-full h-[40px] flex items-center justify-start gap-2"
      >
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start justify-center">
          <div className="flex gap-2">
            <h2 className="text-white font-bold">Abdulrahman Idrees</h2>
            <h6 className="text-[#ffffff66]">| 2 Days Ago</h6>
          </div>
          <h6 className="text-[#ffffff66]">@akhaled01</h6>
        </div>
      </div>
      <div
        id="post-content"
        className="w-full flex flex-col items-center justify-center gap-2"
      >
        <div id="post-text-content" className="text-white">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
          accusantium quidem sapiente dolorum velit exercitationem aliquam
          consectetur at repellendus! Soluta eius harum sunt nesciunt quibusdam
          voluptatem dolorum doloremque nisi sapiente!
        </div>
        <Image
          src={
            "https://dgnqdreynxmovfqozriv.supabase.co/storage/v1/object/public/main-bonfire-bucket/Screenshot%20from%202024-08-05%2011-40-40.png"
          }
          className="w-full h-[200px] rounded-lg"
          alt="helloo"
          width={400}
          height={400}
        />
      </div>
    </div>
  );
};

export default PostComponent;
