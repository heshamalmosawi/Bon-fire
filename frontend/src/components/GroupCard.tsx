// GroupCard.tsx

import React from "react";
import { Button } from "@/components/ui/button";

interface GroupCardProps {
  name: string;
  description: string;
  members: number;
  isMine: boolean;
  isMember: boolean;
  onJoinClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  name,
  description,
  members,
  isMine,
  isMember,
  onJoinClick,
}) => {
  return (
    <div className="bg-black p-4 rounded-md shadow-md">
      <h2 className="text-white text-lg font-semibold">{name}</h2>
      <p className="text-gray-400">{description}</p>
      <p className="text-gray-400">Members: {members}</p>
      {!isMine && !isMember && (
        <Button variant="secondary" className="mt-4" onClick={onJoinClick}>
          Join
        </Button>
      )}
    </div>
  );
};

export default GroupCard;
