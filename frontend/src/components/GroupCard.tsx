import React from "react";

interface GroupCardProps {
  name: string;
  description: string;
  members: number;
  isMine: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ name, description, members, isMine }) => {
  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-md text-white">
      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-400">{description}</p>
        <div className="mt-2 text-sm">
          <p>Members: {members}</p>
        </div>
        <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
          {isMine ? "Enter" : "Join"}
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
