import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
import ToolTipWrapper from "../ToolTipWrapper";
import { getAgo } from "@/lib/utils";
import CommentDialog from "../CommentDialog";  // Import the CommentDialog component

const PostComponent = (props: PostProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return (
    <div
      className={`max-h-[540px] bg-black rounded-lg flex flex-col items-center justify-center px-4 py-4 gap-4`}
      onClick={openDialog}
    >
      <div
        id="user-content"
        className="w-full h-[40px] flex items-center justify-start gap-2"
      >
        <Avatar>
          <AvatarImage src={props.avatarUrl} />
          <AvatarFallback>{`${props.firstName[0]}${props.lastName[0]}`}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start justify-center">
          <div className="flex gap-2">
            <h2 className="text-white font-bold">{`${props.firstName} ${props.lastName}`}</h2>
            <h6 className="text-[#ffffff66]">| {getAgo(props.creationDate)}</h6>
          </div>
          <h6 className="text-[#ffffff66]">
            {props.username ? `@${props.username}` : ""}
          </h6>
        </div>
      </div>
      <div
        id="post-content"
        className="w-full flex flex-col items-center justify-center gap-4"
      >
        <div id="post-text-content" className="text-white text-sm w-full">
          {props.postTextContent}
        </div>
        {props.postImageContentUrl ? (
          <Image
            src={props.postImageContentUrl}
            className="w-full h-[200px] rounded-lg"
            alt="post image"
            width={400}
            height={400}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="w-full h-[44px] flex items-center justify-around gap-4 border-b-[0.1px] border-b-[#3838386f] border-t-[0.1px] border-t-[#3838386f]">
        <ToolTipWrapper text={`${props.postLikeNum} Likes`}>
          <Heart
            color="white"
            className="cursor-pointer hover:stroke-red-600 duration-300"
          />
        </ToolTipWrapper>
        <ToolTipWrapper text={`${props.postCommentNum} comments`}>
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
      <Input
        className="w-full bg-transparent text-white border-[0.1px] border-[#3838386f]"
        placeholder="Add a comment..."
      />
            {/* Comment Dialog */}
            <CommentDialog isOpen={isDialogOpen} onClose={closeDialog} post={props} />
    </div>
  );
};

export default PostComponent;
