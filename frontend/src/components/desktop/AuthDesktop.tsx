import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import anime from "animejs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HandleLoginSubmission, loginSchema } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import TypingAnimation from "../TypingAnimation";
import SignupForm from "./SignupForm";
import { ToastAction } from "@radix-ui/react-toast";

const AuthDesktop: FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  //* we wrap submission handlers around this for UI friendly errors, and redirection handling
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const res = await HandleLoginSubmission(values);
    if (res) {
      if (res === "unauthorized") {
        toast({
          title: "Invalid credentials!",
          description:
            "Check your login details, or signup if you have no account!",
          variant: "destructive",
          action: (
            <ToastAction altText="signup" onClick={handleNoAccountClick} className="text-sm w-[65%] border-white font-bold">
              Sign Up instead
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: "Internal Server Error",
          description:
            "Apologies for the inconvenience!, check the console logs",
          variant: "destructive",
        });
      }
      return
    }
    router.push("/"); // redirect to / after login
  };

  const handleNoAccountClick = () => {
    anime({
      targets: "#pic-div",
      translateX: "50vw",
      update: () => {
        document.getElementById("pic-div")!.className =
          "relative w-[50%] h-full bg-bonfire bg-cover rounded-l-3xl z-10";
      },
      duration: 3000,
      easing: "easeOutExpo",
    });
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-neutral-950">
      <div
        id="pic-div"
        className="relative w-[50%] h-full bg-bonfire bg-cover rounded-r-3xl z-10"
      ></div>
      <div className="absolute top-0 left-0 w-[50%] flex items-center justify-center">
        <SignupForm />
      </div>
      <div className="w-[50%] h-full flex flex-col items-center justify-center gap-7">
        <TypingAnimation />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[80%]"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="dark">
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full text-white"
                      placeholder="noobmaster69@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="dark">
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full text-white"
                      type="password"
                      placeholder="**********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-indigo-500 hover:bg-indigo-700"
              type="submit"
            >
              Login
            </Button>
          </form>
        </Form>
        <Button
          className="text-white"
          variant={"link"}
          onClick={handleNoAccountClick}
        >
          No Account?
        </Button>
      </div>
    </main>
  );
};

export default AuthDesktop;
