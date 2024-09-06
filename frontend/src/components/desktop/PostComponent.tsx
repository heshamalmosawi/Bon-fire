import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Forward, Heart, MessageSquare } from "lucide-react";
import ToolTipWrapper from "../ToolTipWrapper";
import { getAgo } from "@/lib/utils";
import CommentDialog from "../CommentDialog"; // Import the CommentDialog component
import { PostProps } from "@/lib/interfaces";
import { useToast } from "../ui/use-toast";

const PostComponent = (props: PostProps) => {
  console.log(props.postIsLiked);
  const [likes, setlikes] = useState(props.postLikeNum);
  const [liked, setliked] = useState(props.postIsLiked);
  const { toast } = useToast();

 const togglePostLike = async () => {
   // Optimistically update the like state
   setliked((prevLiked) => {
     const newLikedState = !prevLiked;
     setlikes((prevLikes) => (newLikedState ? prevLikes + 1 : prevLikes - 1));
     return newLikedState;
   });

   try {
     const res = await fetch(`http://localhost:8080/like_post/${props.id}`, {
       method: "POST",
       credentials: "include",
       headers: {
         "Content-Type": "application/json",
       },
     });

     if (res.status !== 200) {
       throw new Error("Failed to toggle like");
     }
   } catch (error) {
     // Revert the like state if there's an error
     setliked((prevLiked) => {
       const newLikedState = !prevLiked;
       setlikes((prevLikes) => (newLikedState ? prevLikes + 1 : prevLikes - 1));
       return newLikedState;
     });

     toast({
       variant: "destructive",
       title: "Error",
       description: "There was an error toggling the like of the post",
     });
   }
 };


  return (
    <div
      className={`max-h-[540px] bg-black rounded-lg flex flex-col items-center justify-center px-4 py-4 gap-4`}
    >
      <div
        id="user-content"
        className="w-full h-[40px] flex items-center justify-start gap-2"
      >
        <Avatar>
          <AvatarImage src={props.avatarUrl} />
          <AvatarFallback>{`${firstNameInitial}${lastNameInitial}`}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start justify-center">
          <div className="flex gap-2">
            <h2 className="text-white font-bold">{`${props.firstName} ${props.lastName}`}</h2>
            <h6 className="text-[#ffffff66]">| {getAgo(props.created_at)}</h6>
          </div>
          <h6 className="text-[#ffffff66]">
            {props.username ? `@${props.username}` : ""}
          </h6>
        </div>
      </div>
      <CommentDialog post={props}>
        <div
          id="post-content"
          className="w-full flex flex-col items-center justify-center gap-4 min-h-[50px]"
        >
          <div id="post-text-content" className="text-white text-sm w-full">
            {props.postTextContent}
          </div>
          {props.postImageContentUrl ? (
            <Image
              src={props.postImageContentUrl}
              className="w-full h-[200px] rounded-lg object-cover"
              alt="post image"
              width={400}
              height={400}
            />
          ) : (
            <></>
          )}
        </div>
      </CommentDialog>
      <div className="w-full h-[44px] flex items-center justify-around gap-4 border-b-[0.1px] border-b-[#3838386f] border-t-[0.1px] border-t-[#3838386f]">
        <ToolTipWrapper text={`${likes} Likes`}>
          <Heart
            color="white"
            className={`cursor-pointer hover:stroke-red-300 duration-300 ${
              liked ? "stroke-red-600" : "stroke-white"
            }`}
            onClick={async () => await togglePostLike()}
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
    </div>
  );
};

export default PostComponent;
