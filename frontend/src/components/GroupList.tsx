import React, { useEffect, useState } from "react";
import GroupCard from "./GroupCard"; // Import the GroupCard component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import GroupCreationDialog from "./CreateGroup"; // Import the GroupCreationDialog component
import { Group } from "@/lib/interfaces";
import { fetchGroups } from "@/lib/queries/groups";
import { useRouter } from 'next/navigation';  // Import the useRouter hook

const AllGroupList: React.FC = () => {
  const [filter, setFilter] = useState("all"); // 'all' or 'mine'
  const [groups, setGroups] = useState<Group[]>([]); // State to hold groups
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state
  const [sessionUser, setSessionUser] = useState<string | null>(null); // State to store the fetched user ID
  const router = useRouter(); // Initialize router for navigation

  // Fetch the authenticated user's session
  useEffect(() => {
    const authenticate = async () => {
      const response = await fetch(`http://localhost:8080/authenticate`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status !== 200) {
        router.push('/auth');
        return;
      } else if (response.status === 200) {
        const data = await response.json();
        setSessionUser(data.User.user_id);
      }
    };
    authenticate();
  }, [router]);

  // Fetch groups from the backend
  useEffect(() => {
    fetchGroups().then((data) => setGroups(data || []));
  }, []);

  // Filter the groups based on the selected filter
  const filteredGroups = groups.filter((group) => {
    if (filter === "mine" && sessionUser) {
      return group.owner_id === sessionUser;
    }
    return true;
  });

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return (
    <div className="ml-1/4 p-2">
      <div className="w-[80%] h-full shadow-md mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-3xl font-semibold">
            Groups ({filteredGroups.length})
          </h1>
          <div className="flex items-center">
            <Select onValueChange={(value) => setFilter(value)}>
              <SelectTrigger className="w-[180px] bg-gray-800 text-white border border-gray-600">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border border-gray-600">
                <SelectItem className="hover:bg-gray-700" value="mine">
                  My Groups
                </SelectItem>
                <SelectItem className="hover:bg-gray-700" value="owned">
                  All Groups
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="ml-4 bg-blue-600 text-white hover:bg-blue-800 rounded-md px-4 py-2"
              onClick={openDialog}
            >
              Create Group
            </Button>
          </div>
        </div>
        <div className="w-full border-t-[0.1px] border-gray-700 mx-auto mb-8"></div>
      </div>

      <div className="w-[80%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <GroupCard
            key={group.group_id}
            name={group.group_name}
            description={group.group_desc}
            members="0" // You might want to update this with the actual number of members
            isMine={group.owner_id === sessionUser} // Use the fetched user ID for determining ownership
          />
        ))}
      </div>

      {/* Group Creation Dialog */}
      <GroupCreationDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </div>
  );
};

export default AllGroupList;
