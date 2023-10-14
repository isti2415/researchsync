import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageReference,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import app from "@/firebase";
import Cookies from "js-cookie";
import { Toaster, toast } from "sonner";
import React from "react";

export default function AddPaper({setShowAddPaper}) {
  const { handleSubmit, control } = useForm();
  const [file, setFile] = React.useState(null);

  const db = getFirestore(app);
  const storage = getStorage(app);

  const handleFileInputChange = (event) => {
    setFile(event.target.files[0]);
    console.log("File: ", file);
  };

  const onSubmit = async (data) => {
    try {
      let fileURL = null; // Initialize fileURL as null

      if (file) {
        const timestamp = Date.now();
        const storageRef = storageReference(
          storage,
          "papers/" + timestamp + file.name
        );

        // Use a promise to await the file upload completion
        await new Promise((resolve, reject) => {
          uploadBytes(storageRef, file)
            .then(() => {
              console.log("File uploaded successfully");
              resolve();
            })
            .catch((error) => {
              console.error("Error uploading file: ", error);
              reject(error);
            });
        });

        // Get the download URL of the uploaded file
        fileURL = await getDownloadURL(storageRef);
      }

      // Create a database entry with or without the file URL
      const papersCollection = collection(db, "papers");
      const newPaperDoc = await addDoc(papersCollection, {
        currentTimestamp: Timestamp.now(),
        added: Cookies.get("user"),
        read: [],
        title: data.title,
        year: data.year,
        country: data.country,
        conference: data.conference,
        impactFactor: data.impactFactor,
        link: data.link,
        stateOfArt: data.stateOfArt,
        mlDl: data.mlDl,
        summary: data.summary,
        fileURL: fileURL, // Include the file URL or null if no file
      });

      console.log("Data written to Firestore with ID: ", newPaperDoc.id);
      toast.success("Paper added successfully");
      // Close the form or perform any other necessary actions
      setShowAddPaper(false);
    } catch (error) {
      console.error("Error uploading file and adding paper: ", error);
      toast.error("Error uploading file and adding paper");
    }
  };

  return (
    <>
      <Toaster closeButton position="top-right" richColors />
      <Card
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 md:w-1/3 w-full"
        style={{ zIndex: "100" }}
      >
        <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight text-center mb-4">
          Add Paper
        </CardTitle>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-2">
              <Controller
                name="title"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Paper Title"
                    required
                  />
                )}
              />
              <Controller
                name="year"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Year" required />
                )}
              />
              <Controller
                name="country"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Country"
                    required
                  />
                )}
              />
              <Controller
                name="conference"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Conference"
                    required
                  />
                )}
              />
              <Controller
                name="impactFactor"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Impact Factor"
                    required
                  />
                )}
              />
              <Controller
                name="link"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} type="text" placeholder="Link" />
                )}
              />
              <Input
                placeholder="File"
                type="file"
                accept=".pdf"
                name="file"
                onChange={handleFileInputChange}
              />
              <Controller
                name="stateOfArt"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="State of Art"
                    required
                  />
                )}
              />
              <Controller
                name="mlDl"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ML/DL" />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 100 }}>
                      <SelectItem value="ML">ML</SelectItem>
                      <SelectItem value="DL">DL</SelectItem>
                      <SelectItem value="ML&DL">ML & DL</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name="summary"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Textarea {...field} placeholder="Summary" required />
                )}
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setShowAddPaper(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
