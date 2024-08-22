import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { Button } from "../ui/button";


interface ProfileProps {
    name: string;
    avatarUrl: string;
}

const ProfileComponent: React.FC<ProfileProps> = ({ name, avatarUrl }) => {
    return (
        <main>
            <div className={`h-56 bg-gray-200 rounded-lg flex items-center justify-center my-8`}>
                {/* Placeholder content for background*/}
            </div>
            
            
            {/* <div className="bg-neutral-950 w-1/6 aspect-square rounded-lg mx-64 fixed top-44 flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-teal-500 w-1/5 aspect-square p-20"></div> */}

                {/* Need to figure out how to scale the component below probably or something idrk then replace the upper div with it.  */}

                {/* <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar> */}
                {/* <Avatar>
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>


                <div className="font-semibold text-3xl text-white truncate w-full max-w-xs px-4">{name}</div>
                <button className="bg-indigo-500 w-4/5 h-10 rounded-md font-semibold text-white"> Edit Profile </button>
            </div> */}
        </main>
        
    );
}
export default ProfileComponent;
