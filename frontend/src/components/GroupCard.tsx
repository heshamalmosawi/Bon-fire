import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  members: number;
  isMine: boolean; // Indicates if the current user is the owner of the group
  isMember: boolean; // Indicates if the current user is a member of the group
  onJoinClick: () => void; // Function to handle "Join" button click
}

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  name,
  description,
  members,
  isMine,
  isMember,
  onJoinClick,
}) => {
  const router = useRouter(); // Initialize useRouter for navigation

  // Function to handle "Enter" button click
  const handleEnterClick = () => {
    router.push(`/groups/${id}`);
  };

  return (
    <div className="bg-black p-4 rounded-md shadow-md">
      {/* Group Name */}
      <h2 className="text-white text-lg font-semibold">{name}</h2>

      {/* Group Description */}
      <p className="text-gray-400">{description}</p>

      {/* Group Members Count */}
      <p className="text-gray-400">Members: {members}</p>

      {/* Conditionally Render Buttons */}
      {isMine || isMember ? (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={handleEnterClick}
        >
          Enter
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={onJoinClick}
        >
          Join
        </Button>
      )}
    </div>
  );
};

export default GroupCard;
