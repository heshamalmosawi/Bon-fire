"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/groups");
  };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-5">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg mb-4">You do not have permission to view this page.</p>
        <Button
        onClick={handleGoBack}
        // className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
      >
        Go Back to Groups Page
      </Button>
      </div>
    );
  };
  
  export default Unauthorized;
  