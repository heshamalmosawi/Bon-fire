"use client";

import { HandleFileUpload } from "@/utils/handleFileUpload";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File>();

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!file) return;

    const imageURI = await HandleFileUpload(file);

    if (!imageURI) {
      console.log("NO IMAGE URI RETURNED");
    } else {
      console.log(imageURI);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
}
