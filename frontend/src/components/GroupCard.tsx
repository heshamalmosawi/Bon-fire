import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; 
import { Hourglass } from "lucide-react";

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  members: number;
  isMine: boolean;
  isMember: boolean;
  isRequested: boolean; 
  onJoinClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  name,
  description,
  members,
  isMine,
  isMember,
  isRequested,
  onJoinClick,
}) => {
  const router = useRouter();

  const handleEnterClick = () => {
    router.push(`/groups/${id}`);
  };

  return (
    <div className="bg-black p-4 rounded-md shadow-md">
      <h2 className="text-white text-lg font-semibold">{name}</h2>
      <p className="text-gray-400">{description}</p>
      <p className="text-gray-400">Members: {members}</p>
      
      {isMine || isMember ? (
        <Button variant="secondary" className="mt-4 bg-indigo-500 hover:bg-indigo-700" onClick={handleEnterClick}>
          Enter
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="mt-4 bg-indigo-500 hover:bg-indigo-700"
          onClick={onJoinClick}
          disabled={isRequested} // Disable button if the request is pending
        >
          {isRequested ? (
            <>
              <Hourglass className="inline-block mr-2" /> Requested
            </>
          ) : (
            "Join"
          )}
        </Button>
      )}
    </div>
  );
};

export default GroupCard;
