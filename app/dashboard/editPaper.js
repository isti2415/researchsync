import { Toaster, toast } from "sonner";
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
import { useForm, Controller, set } from "react-hook-form";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageReference,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "@/firebase";
import Cookies from "js-cookie";
import React from "react";

export default function EditPaper({ setShowEditPaper, selectedPaper }) {
  const { handleSubmit, control } = useForm();
  const [file, setFile] = React.useState(null);

  const db = getFirestore(app);
  const storage = getStorage(app);

  const handleFileInputChange = (event) => {
    setFile(event.target.files[0]);
    console.log("File: ", file);
  };

  const handleDelete = async () => {
    try {
      const papersCollection = collection(db, "papers");
      const paperDocRef = doc(papersCollection, selectedPaper.id);
      const paperDocSnapshot = await getDoc(paperDocRef);
      const paperData = paperDocSnapshot.data();
      const fileURL = paperData.fileURL;

      const parts = fileURL.split("/");
      let storagePath = parts[parts.length - 1];
      storagePath = storagePath.split("%2F").join("/");
      storagePath = storagePath.split("?")[0];

      const fileRef = storageReference(storage, storagePath);

      await deleteObject(fileRef);
      console.log("File deleted successfully");

      await deleteDoc(paperDocRef);

      console.log("Paper deleted successfully");
      toast.success("Paper deleted successfully");
    } catch (error) {
      console.error("Error deleting paper: ", error);
      toast.error("Error deleting paper");
    }
  };

  // Function to update the paper data
  const updatePaper = async (paperId, newData) => {
    alert(newData);
    try {
      // Update the paper data in the Firestore database
      const paperDocRef = doc(db, "papers", paperId);
      await updateDoc(paperDocRef, newData);
      console.log("Paper updated successfully");
      toast.success("Paper updated successfully");
    } catch (error) {
      console.error("Error updating paper:", error);
      toast.error("Error updating paper");
    }
  };

  // Function to upload a file to Firebase Storage
  const uploadFile = async (file) => {
    try {
      if (file) {
        const timestamp = Date.now();
        const storageRef = storageReference(
          storage,
          "papers/" + timestamp + file.name
        );

        // Upload the file and wait for the upload to complete
        await uploadBytes(storageRef, file);

        // Retrieve the download URL and set it to fileUrl
        const url = await getDownloadURL(storageRef);
        // After getting the URL, you can proceed to delete the old file
        
        return url;
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast.error("Error uploading file");
    }
  };

  // Function to handle form submission
  const onSubmit = async (data) => {
    let fileUrl = null;
    if (file) {
      fileUrl = await uploadFile(file);
    } else {
      fileUrl = selectedPaper.fileURL;
    }
    // Update the paper data with the edited values from the form
    updatePaper(selectedPaper.id, {
      title: data.title,
      year: data.year,
      country: data.country,
      conference: data.conference,
      impactFactor: data.impactFactor,
      link: data.link,
      stateOfArt: data.stateOfArt,
      mlDl: data.mlDl,
      summary: data.summary,
      fileURL: fileUrl,
    });

    // Close the edit form or perform any other necessary actions
    setShowEditPaper(false);
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
                defaultValue={selectedPaper.title}
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
                defaultValue={selectedPaper.year}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Year" required />
                )}
              />
              <Controller
                name="country"
                control={control}
                defaultValue={selectedPaper.country}
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
                defaultValue={selectedPaper.conference}
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
                defaultValue={selectedPaper.impactFactor}
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
                defaultValue={selectedPaper.link}
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
                defaultValue={selectedPaper.stateOfArt}
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
                defaultValue={selectedPaper.mlDl}
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
                defaultValue={selectedPaper.summary}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Summary" required />
                )}
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setShowEditPaper(false)}
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
