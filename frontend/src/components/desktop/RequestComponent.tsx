import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RequestProps } from "@/lib/interfaces";
import { joinGroup } from "@/lib/api"; // Adjust the import path to where joinGroup is defined

const RequestComponent: React.FC<RequestProps> = ({
  id, // User ID
  username,
  creationDate,
  avatarUrl,
  groupID, // Group ID
  onRequestHandled, // Function to handle request removal
}) => {
  const [isLoading, setIsLoading] = useState(false); // State to handle loading state

  const handleAccept = async () => {
    console.log(`Attempting to join group ${groupID} for user ${id}`);
    setIsLoading(true); // Set loading state to true

    const success = await joinGroup(groupID, id, true); // Use userId and groupID for the joinGroup function

    if (success) {
      console.log(`User ${id} successfully joined group ${groupID}.`);
      onRequestHandled(id); // Remove the request from the list
    } else {
      console.error(`Failed to join group ${groupID} for user ${id}.`);
    }

    setIsLoading(false); // Reset loading state
  };

  const handleIgnore = async () => {
    console.log(`Ignored request for user ${username} (ID: ${id})`);
    const success = await joinGroup(groupID, id, false);
    if (success) {
      console.log(`User ${id} successfully joined group ${groupID}.`);
      onRequestHandled(id); // Remove the request from the list
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-white font-semibold">{username}</h2>
            <h6 className="text-sm text-gray-400">{creationDate}</h6>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          onClick={handleAccept}
          className="bg-green-600 text-white hover:bg-green-700"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? "Joining..." : "Accept"}
        </Button>
        <Button
          onClick={handleIgnore}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Ignore
        </Button>
      </div>
    </div>
  );
};

export default RequestComponent;
