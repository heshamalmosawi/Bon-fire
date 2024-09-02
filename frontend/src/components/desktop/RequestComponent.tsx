import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Importing Button component
import { RequestProps } from "@/lib/interfaces";

const RequestComponent = (props: RequestProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleAccept = () => {
    console.log(`Accepted request from ${props.username}`);
    // Add logic to handle accept request here
  };

  const handleIgnore = () => {
    console.log(`Ignored request from ${props.username}`);
    // Add logic to handle ignore request here
  };

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={props.avatarUrl} />
            <AvatarFallback>{props.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-white font-semibold">{props.username}</h2>
            <h6 className="text-sm text-gray-400">{getAgo(props.creationDate)}</h6>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={handleAccept} className="bg-green-600 text-white hover:bg-green-700">
          Accept
        </Button>
        <Button onClick={handleIgnore} className="bg-red-600 text-white hover:bg-red-700">
          Ignore
        </Button>
      </div>
    </div>
  );
};

export default RequestComponent;
