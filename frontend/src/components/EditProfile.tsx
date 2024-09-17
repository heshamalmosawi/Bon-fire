import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useToast } from "./ui/use-toast";

interface ProfileFormData {
  fname: string;
  lname: string;
  username: string;
  email: string;
  dob: string;
  bio: string;
  privacy: boolean;
  onEdit: Function;
}

const EditProfile: React.FC<ProfileFormData> = ({
  fname,
  lname,
  username,
  email,
  dob,
  bio,
  privacy,
  onEdit,
}) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fname,
    lname,
    username,
    email,
    dob,
    bio,
    privacy,
    onEdit: () => {}, // empty function just so we can ignore it.
  });

  // stupid useeffect cause rendering.
  useEffect(() => {
    setProfileData((prevData) => ({
      ...prevData,
      fname,
      lname,
      email,
      dob,
      username,
      bio,
      privacy,
    }));
  }, [fname, lname, username, bio, privacy]);

  // updating the profile data when the user types in the input fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // updating the privacy setting if the user toggles the switch
  const handleSwitchChange = (checked: boolean) => {
    setProfileData((prevData) => ({
      ...prevData,
      privacy: checked,
    }));
  };

  // sending the updated profile data to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      UserFirstName: profileData.fname.trim(),
      UserLastName: profileData.lname.trim(),
      UserNickname: profileData.username.trim(),
      UserBio: profileData.bio.trim(),
      ProfileExposure: profileData.privacy ? "Private" : "Public",
    };

    try {
      const response = await fetch("http://localhost:8080/profile/update", {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const result = await response.json();
      onEdit({
        fname: profileData.fname.trim(),
        lname: profileData.lname.trim(),
        nickname: profileData.username.trim(),
        email: email,
        dob: dob,
        bio: profileData.bio.trim(),
        privacy: profileData.privacy ? "Private" : "Public",
      });
      console.log("Profile updated:", result);
      toast({
        variant: "default",
        title: "Success!",
        description: "Profile updated successfully!"
      })
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error!",
        description: "There was an error updating the profile",
      });
    }
  };
  return (
    <Dialog>
      <DialogTrigger className="mt-4 px-4 bg-indigo-500 text-white w-full py-2 rounded hover:bg-indigo-700">
        Edit Profile
      </DialogTrigger>
      <DialogContent className="pb-4 bg-neutral-900 text-white border-none">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="fname" className="text-sm">
            First name
          </Label>
          <Input
            id="fname"
            defaultValue={fname}
            name="fname"
            className="bg-neutral-900 border-neutral-700 border-2"
            onChange={handleInputChange}
          />
          <Label htmlFor="lname" className="text-sm">
            Last name
          </Label>
          <Input
            id="lname"
            defaultValue={lname}
            name="lname"
            className="bg-neutral-900 border-neutral-700 border-2"
            onChange={handleInputChange}
          />
          <div>
            <Label htmlFor="username" className="text-sm">
              Username
            </Label>
            <Input
              id="username"
              defaultValue={username}
              name="username"
              className="bg-neutral-900 border-neutral-700 border-2"
              onChange={handleInputChange}
            />
            <Label htmlFor="bio" className="text-sm">
              {" "}
              Bio{" "}
            </Label>
            <Textarea
              defaultValue={bio}
              className="bg-neutral-900 border-neutral-700 border-2"
              spellCheck={false}
              name="bio"
              onChange={handleInputChange}
            />
            <div className="mt-4 flex justify-between">
              <Label
                htmlFor="privacy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm ml-1"
              >
                Private account
              </Label>
              <Switch
                id="privacy"
                name="privacy"
                checked={profileData.privacy}
                onCheckedChange={handleSwitchChange}
                className="data-[state=unchecked]:bg-neutral-400 data-[state=checked]:bg-indigo-500"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button className="bg-indigo-500 hover:bg-indigo-700">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
