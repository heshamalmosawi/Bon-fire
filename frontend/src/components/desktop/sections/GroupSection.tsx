import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Group } from "@/lib/interfaces";
import { fetchGroups } from "@/lib/queries/groups";
import { useToast } from "@/components/ui/use-toast";

const GroupSection = () => {
  const [groups, setgroups] = useState<Group[]>();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups().then((data) => {
      if (data) {
        setgroups(data);
        console.log(data)
      } else {
        toast({
          variant: "destructive",
          title: "Error getting groups"
        })
      }
    });
  }, []);

  return groups ? (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Groups</h2>
      </div>
      <ScrollArea className="max-h-[100px] h-fit">
        {groups.map((group) => (
          <div
            key={group.group_id}
            className="flex items-center justify-between mb-3 text-sm"
          >
            <div className="flex items-center">
              <Avatar className="mr-2 bg-gray-500">
                <AvatarImage src={""} />
                <AvatarFallback className="text-white bg-gray-500">
                  {group.group_name[0]}
                </AvatarFallback>
              </Avatar>
              <span>{group.group_name}</span>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  ) : (
    <></>
  );
};

export default GroupSection;
