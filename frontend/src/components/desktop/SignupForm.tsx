"use client";

import React, { FC, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
  signupSchema,
  HandleSignupSubmission,
} from "@/lib/schemas/signupSchema";
import { useToast } from "../ui/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import anime from "animejs";

const SignupForm: FC = () => {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [loading, setloading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      user_email: "",
      user_password: "",
      confirmPassword: "",
      user_fname: "",
      user_lname: "",
      user_dob: new Date(2000, 8, 1), 
      avatar: undefined,
      user_nickname: "",
      user_about: "",
    },
  });

  const handleHaveAccountClick = () => {
    anime({
      targets: "#pic-div",
      translateX: "0",
      update: () => {
        const picDiv = document.getElementById("pic-div");
        if (picDiv) {
          picDiv.className =
            "relative w-[50%] h-full bg-bonfire bg-cover rounded-r-3xl z-10";
        }
      },
      duration: 3000,
      easing: "easeOutExpo",
    });
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    console.log("Submitting form with values:", values);
    console.log(form.formState.errors);
    try {
      setloading(true);
      await HandleSignupSubmission(values);
      toast({
        title: "Success!",
        description: "Signup successful!",
      });
      setloading(false);
      handleHaveAccountClick();
    } catch (error) {
      console.error("Signup submission failed:", error);
      toast({
        title: "Error!",
        description: "Check the logs for more",
        variant: "destructive",
      });
      setloading(false);
    }
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      form.setValue("avatar", file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-[50%] h-full flex flex-col items-center justify-center gap-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full mx-auto"
          >
            {!showAdditionalFields ? (
              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="user_email"
                  render={({ field }) => (
                    <FormItem className="dark">
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          className="dark text-white"
                          type="email"
                          placeholder="john.doe@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="user_password"
                  render={({ field }) => (
                    <FormItem className="dark">
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input
                          className="text-white"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="dark">
                      <FormLabel className="text-white">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-white"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full bg-blue-400 hover:bg-blue-800 rounded-md"
                  type="button"
                  onClick={() => setShowAdditionalFields(true)}
                >
                  Next
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-4">
                  <FormField
                    control={form.control}
                    name="user_fname"
                    render={({ field }) => (
                      <FormItem className="dark">
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full text-white"
                            placeholder="John"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user_dob"
                    render={({ field }) => (
                      <FormItem className="dark flex flex-col text-white">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="dark w-auto p-0 border-4"
                            align="start"
                          >
                            <Calendar
                              initialFocus
                              mode="single"
                              className="bg-neutral-950 text-white"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user_nickname"
                    render={({ field }) => (
                      <FormItem className="dark">
                        <FormLabel className="text-white">
                          Nickname (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full text-white"
                            placeholder="Nickname"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-4">
                  <FormField
                    control={form.control}
                    name="user_lname"
                    render={({ field }) => (
                      <FormItem className="dark">
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full text-white"
                            placeholder="Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem className="dark">
                        <FormLabel className="text-white">Avatar</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center justify-center gap-4">
                            {avatarPreview && (
                              <img
                                src={avatarPreview}
                                alt="Avatar Preview"
                                className="mt-4 w-20 h-20 rounded-full mx-auto"
                              />
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="w-full text-white file:text-white"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user_about"
                    render={({ field }) => (
                      <FormItem className="dark">
                        <FormLabel className="text-white">
                          Bio (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="w-full text-white"
                            placeholder="Tell us about yourself..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2 flex justify-between">
                  <Button
                    className="bg-gray-600 text-white rounded-md py-2 hover:bg-gray-800"
                    type="button"
                    onClick={() => setShowAdditionalFields(false)}
                  >
                    Back
                  </Button>
                  <Button
                    className="bg-indigo-500 text-white rounded-md py-2 hover:bg-indigo-700"
                    type="submit"
                    disabled={loading}
                  >
                    Complete Sign Up
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
        <Button
          className="text-white w-full text-center"
          variant={"link"}
          onClick={handleHaveAccountClick}
        >
          Got an Account?
        </Button>
      </div>
    </main>
  );
};

export default SignupForm;
