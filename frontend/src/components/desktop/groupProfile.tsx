import React from "react";

// Define the expected props for the Group component
export interface GroupProps {
  groupName: string;
  ownerName: string;
  description: string;
  totalMembers: number;
  session_user: string;
  groupID: string;
}

export const Group: React.FC<GroupProps> = ({
  groupName,
  ownerName,
  description,
  totalMembers,
  session_user,
  groupID,
}) => {
  return (
    <div className="ml-1/4 p-2">
      <div className="w-[100%] h-full shadow-md mx-auto mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white text-3xl font-semibold">{groupName}</h1>
          <h1 className="text-white/50 text-l font-semibold order-last mt-5">
            Members: {totalMembers}
          </h1>
        </div>
        <div className="mb-4">
      <p className="text-white/50 text-l font-semibold">{description}</p>
    </div>
        <div className="w-full border-t-[0.1px] border-gray-700 mx-auto mb-8"></div>
      </div>

      <div className="w-[80%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Additional group content like members, posts, etc., can be displayed here */}
      </div>

      <div>
        {/* <h2 className="text-2xl font-semibold">{ownerName}</h2> */}
        {/* <p className="text-gray-400 mt-2">{description}</p> */}
        {/* Example: Allow the group owner to edit the group details */}
        {session_user && session_user === groupID && (
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
            Edit Group
          </button>
        )}
      </div>
    </div>
  );
};

export default Group;
