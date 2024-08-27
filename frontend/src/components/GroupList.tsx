import React, { useState } from "react";
import GroupCard from "./GroupCard";  // Import the GroupCard component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const people = [
  {
    name: 'Carter Philips',
    description: 'IT NEERRRRRDSSS',
    members: '53',
    isMine: true,
  },
  {
    name: 'Wilson Bergson',
    description: 'SIGMAA',
    members: '5',
    isMine: false,
  },
  // Add more people as needed
];

const AllPeopleList: React.FC = () => {
  const [filter, setFilter] = useState('all'); // 'all' or 'mine'

  // Filter the groups based on the selected filter
  const filteredPeople = people.filter(person => {
    if (filter === 'mine') {
      return person.isMine;
    }
    return true; // Return all groups if filter is 'all'
  });

  return (
    <div className="ml-1/4 p-2">
      <div className="w-[80%] h-full shadow-md mx-auto mb-8">  
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-3xl font-semibold">Groups ({filteredPeople.length})</h1>
          <Select onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-[180px] bg-gray-800 text-white border border-gray-600">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border border-gray-600">
              <SelectItem className="hover:bg-gray-700" value="mine">
                My Groups
              </SelectItem>
              <SelectItem className="hover:bg-gray-700" value="all">
                All Groups
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full border-t-[0.1px] border-gray-700 mx-auto mb-8"></div>
      </div>

      <div className="w-[80%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person, index) => (
          <GroupCard
            key={index}
            name={person.name}
            description={person.description}
            members={person.members}
            isMine={person.isMine}
          />
        ))}
      </div>
    </div>
  );
};

export default AllPeopleList;
