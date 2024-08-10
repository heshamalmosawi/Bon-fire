export const HandleFileUpload = async (file: File): Promise<string> => {
  try {
    if (
      file.type !== "image/png" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/jpg" &&
      file.type !== "image/gif"
    ) {
      throw new Error("image mime type in unacceptable");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.log(error);
    return ""
  }
};
