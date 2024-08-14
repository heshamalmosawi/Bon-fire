export const HandleFileUpload = async (file: File): Promise<string> => {
  try {
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
