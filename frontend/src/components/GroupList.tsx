import React, { useEffect, useState } from "react";
import GroupCard from "./GroupCard"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import GroupCreationDialog from "./CreateGroup"; 
import ConfirmJoinDialog from "./confirmGroupJoin"; 
import { Group } from "@/lib/interfaces";
import { fetchGroups } from "@/lib/queries/groups";
import { useRouter } from "next/navigation"; 

const AllGroupList: React.FC = () => {
  const [filter, setFilter] = useState("all"); 
  const [newGroup, setNewGroup] = useState(false)
  const [newjoinrequest, setnewjoinrequest] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [sessionUser, setSessionUser] = useState<string | null>(null); 
  const [isConfirmJoinDialogOpen, setIsConfirmJoinDialogOpen] = useState(false); 
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null); 
  const router = useRouter(); 

  // Fetch the authenticated user's session
  useEffect(() => {
    const authenticate = async () => {
      const response = await fetch(`http://localhost:8080/authenticate`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status !== 200) {
        router.push("/auth");
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
    const loadGroups = async () => {
      const data = await fetchGroups();
      console.log("Fetched Groups:", data); // Debugging: Print fetched groups data
      setGroups(data || []);
    };
    loadGroups();
    setNewGroup(false)
    setnewjoinrequest(false)
  }, [newGroup, newjoinrequest]);

  // Filter the groups based on the selected filter
  const filteredGroups = groups.filter((group) => {
    if (filter === "mine" && sessionUser) {
      return group.owner_id === sessionUser;
    }
    if (filter === "joined" && sessionUser) {
      return group.is_member;
    }
    return true;
  });

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => {
    setIsDialogOpen(false);
    setNewGroup(true)
  }

  const openConfirmJoinDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsConfirmJoinDialogOpen(true);
  };

  const closeConfirmJoinDialog = () => {
    setSelectedGroup(null);
    setIsConfirmJoinDialogOpen(false);
    setnewjoinrequest(true);
  };

const handleConfirmJoin = async () => {
  if (selectedGroup && sessionUser) {
    try {
      const response = await fetch(`http://localhost:8080/group/request`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: selectedGroup.group_id,
        }),
      });

      if (response.ok) {
        console.log(`Request to join group ${selectedGroup.group_name} has been sent.`);
        // Update the group in the local state to reflect the requested status
        const updatedGroups = groups.map(group => 
          group.group_id === selectedGroup.group_id ? { ...group, isRequested: true } : group
        );
        setGroups(updatedGroups);
      } else {
        console.error("Failed to send join request:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending join request:", error);
    }

    closeConfirmJoinDialog();
  }
};


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
                <SelectItem className="hover:bg-gray-700" value="all">
                  All Groups
                </SelectItem>
                <SelectItem className="hover:bg-gray-700" value="mine">
                  My Groups
                </SelectItem>
                <SelectItem className="hover:bg-gray-700" value="joined">
                  Joined Groups
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="ml-4 bg-indigo-500 text-white hover:bg-indigo-700 rounded-md px-4 py-2"
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
            id={group.group_id}
            name={group.group_name}
            description={group.group_desc}
            members={group.total_members} // Updated to use the actual number of members
            isMine={group.owner_id === sessionUser} // Determine ownership
            isMember={group.is_member}
            isRequested = {group.is_requested} // Determine membership
            onJoinClick={() => openConfirmJoinDialog(group)} // Pass the group to the confirmation dialog
          />
        ))}
      </div>

      {/* Group Creation Dialog */}
      <GroupCreationDialog isOpen={isDialogOpen} onClose={closeDialog} />

      {/* Confirm Join Dialog */}
      <ConfirmJoinDialog
        isOpen={isConfirmJoinDialogOpen}
        onClose={closeConfirmJoinDialog}
        onConfirm={handleConfirmJoin}
      />
    </div>
  );
};

export default AllGroupList;
