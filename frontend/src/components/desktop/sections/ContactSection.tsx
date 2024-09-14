import React, { useEffect, useState }  from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWebSocket from "@/hooks/useWebSockets";
import { getChatList, fetchSessionUser } from '@/lib/api';
import { notFound, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from "@/components/desktop/UserList";

// const contacts = [
//   { name: "Desirae Schleifer", avatar: "/path/to/avatar1.jpg", online: true },
//   { name: "Jocelyn Dias", avatar: "/path/to/avatar2.jpg", online: true },
//   { name: "Marilyn Franci", avatar: "/path/to/avatar3.jpg", online: true },
//   { name: "Nolan Dorwart", avatar: "/path/to/avatar4.jpg", online: true },
//   { name: "Kianna George", avatar: "/path/to/avatar5.jpg", online: false },
//   { name: "Helena Thornot", avatar: "/path/to/avatar6.jpg", online: true },
//   { name: "Carla Westervelt", avatar: "/path/to/avatar7.jpg", online: false },
//   { name: "Jaydon Torff", avatar: "/path/to/avatar8.jpg", online: true },
//   { name: "Mira Curtis", avatar: "/path/to/avatar9.jpg", online: false },
//   { name: "Chance Septimus", avatar: "/path/to/avatar10.jpg", online: true },
//   { name: "Ashlynn Aminoff", avatar: "/path/to/avatar11.jpg", online: true },
// ];

interface Contact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}
// export interface User {
//   user_id: string;
//   user_fname: string;
//   user_lname: string;
//   user_nickname?: string;
//   user_profile_pic?: string;
//   is_followed: boolean;
//   // user_email: string;
// }

const ContactSection = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newMessageFlag, setNewMessageFlag] = useState(false);
  const [sessionUser, setSessionUser] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [clickCount, setClickCount] = useState(0);  
  const [users, setUsers] = useState<User[]>([]);
  const [NoF, SetFollowera] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      if (!data && sessionUser === undefined) {
        router.push('/auth');
        return;
      } else if (data && data.status === 200) { // if user is authenticated and u_id is defined in URL
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
        console.log("u_id:", sessionUser);

      }
    };
    getSessionUser();
  }, [sessionUser, clickCount]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (sessionUser != "") {
        await getChatList(setLoading, setError, setActiveTab, setData);
        if ((data && data.response === "Handling default message") || (data === null)) {
          setUsers([]);
          console.log("first");
        } else if (data && data.response === null) {
          SetFollowera(true);
          setUsers([]);
          setContacts([]);
          console.log("second");
        } else {
          setUsers(data.response);
          console.log("data.response:", data.response);
          console.log("third");
          const contacts = data.response.map((user: User) => ({
            id: user.user_id,
            name: user.user_fname + " " + user.user_lname,
            avatar: user.user_profile_pic,
            online: false,
          }));
          setContacts(contacts);
        // }
        }
      }
      // setUsers(data.response);
    };
    // if (sessionUser === "") {
    //   getSessionUser().then(user => {
    //     setSessionUser(user);
    //     fetchUsers();
    //   });
    // } else {
      // getSessionUser()
      fetchUsers();
    // }
  }, [sessionUser, clickCount]);

  console.log("contacts:", contacts);

  // useEffect(() => {
    // console.log("flag has been changed", newMessageFlag);
    useEffect(() => {
      const interval = setInterval(() => {
        setClickCount((prevCount) => prevCount + 1);
      }, 5000);

      return () => clearInterval(interval);
    }, []);
  // }, []);

  const handleClickCount = () => {
    setClickCount(prevCount => prevCount + 1);
  };

  const handleMessage = (message: any) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.name === message.name
          ? { ...contact, online: true }
          : contact
      )
    );
  };
  

  const { sendMessage } = useWebSocket(
    "ws://localhost:8080/ws",
    null,
    null,
    null,
    handleMessage,
    setNewMessageFlag,
    newMessageFlag
  );

  return (
    <div className="w-full" onClick={handleClickCount}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
      </div>
      <ScrollArea className="h-[300px]">
        {contacts.map((contact, index) => (
          <Link href={`/profile/${contact.id}`} key={index} legacyBehavior>
            <a>
          <div
            key={index}
            className="flex items-center justify-between mb-3 text-sm"

          >
            <div className="flex items-center">
              <Avatar className="mr-2 bg-gray-500">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback className="text-white bg-gray-500">
                  {contact.name[0] } 
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{contact.name}</span>
                {/* <span
                  className={`w-2 h-2 rounded-full mt-1 -ml-4 z-10 ${
                    contact.online ? "bg-green-500" : "bg-gray-500"
                  }`}
                /> */}
              </div>
            </div>
          </div>
          </a>
          </Link>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ContactSection;
