import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Forward, Heart, MessageSquare } from "lucide-react";
import ToolTipWrapper from "../ToolTipWrapper";
import { CommentModel } from "@/lib/interfaces";
import { useToast } from "../ui/use-toast";

const CommentComponent = (item: CommentModel) => {
  const [likes, setLikes] = useState(item.comment_likecount);
  const [liked, setLiked] = useState(item.comment_is_liked);
  const { toast } = useToast();

  const toggleLike = async () => {
    const res = await fetch(
      `http://localhost:8080/like_comment/${item.comment_id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status !== 200) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error toggling the like of the comment",
      });
    } else {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
    }
  };

  return (
    <div className="flex gap-2">
      <Avatar>
        <AvatarImage src={item.full_user.user_avatar_path} />
        <AvatarFallback>
          {item.full_user.user_fname[0]}
          {item.full_user.user_lname[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <h6 className="text-white font-semibold">
          {item.full_user.user_fname} {item.full_user.user_lname}
        </h6>
        <p className="text-[#ffffff66]">{item.comment_content}</p>
        {item.comment_image_path && (
          <Image
            src={item.comment_image_path}
            alt="comment image"
            width={70}
            height={70}
            className="object-cover w-auto h-auto max-w-[300px] rounded-lg"          />
        )}
        <div className="flex items-center gap-4 text-xs text-[#ffffff66] mt-2">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={async () => await toggleLike()}
          >
            <Heart
              className={`w-4 h-4 ${
                liked ? "text-red-600 fill-current" : "text-white"
              }`}
            />
            <span>{likes} Likes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
