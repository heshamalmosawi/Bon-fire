import React, { useEffect, useState } from "react";

interface UserListProps {
  onSelectUser: (user: User) => void;
  sessionUser: string;
}

export interface User {
  user_id: string;
  user_fname: string;
  user_lname: string;
  user_nickname?: string;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, sessionUser }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/people", {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          console.log(response);
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  // delete my user from the list
  const myUser = users.findIndex((user) => user.user_id === sessionUser);
  if (myUser > -1) {
    users.splice(myUser, 1);
  }

  return (
    <div className="w-1/4 h-full p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-white">Users</h3>
      <ul>
        {users.map((user) => (
          <li
            key={user.user_id}
            className="p-2 text-white cursor-pointer hover:bg-gray-700"
            onClick={() => onSelectUser(user)}
          >
            {user.user_fname + " " + user.user_lname}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;