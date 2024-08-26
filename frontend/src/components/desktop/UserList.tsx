import React from "react";

interface UserListProps {
  onSelectUser: (userId: string) => void;
}

const users = [
  { id: "1", name: "User One" },
  { id: "2", name: "User Two" },
];

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
  return (
    <div className="w-1/4 h-full bg-black p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-white">Users</h3>
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            className="p-2 text-white cursor-pointer hover:bg-gray-700"
            onClick={() => onSelectUser(user.id)}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;