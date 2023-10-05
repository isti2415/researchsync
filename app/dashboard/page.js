"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster, toast } from "sonner";
import app from "@/firebase";
import {
  getStorage,
  ref as storageReference,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useForm, Controller, set } from "react-hook-form";
import FahadSir from "@/components/avatars/fahad-sir";
import Biru from "@/components/avatars/biru";
import Istiaq from "@/components/avatars/istiaq";
import Niaz from "@/components/avatars/niaz";
import Sabrina from "@/components/avatars/sabrina";
import { arrayRemove, arrayUnion } from "firebase/firestore";

const Dashboard = (page) => {
  const router = useRouter();

  useEffect(() => {
    const user = Cookies.get("user");

    if (!user) {
      router.push("/");
    }
    else{
      getPapers();
    }
  }, []);

  const [file, setFile] = useState(null);
  const [showAddPaper, setShowAddPaper] = useState(false);

  const handleLogOut = () => {
    console.log("Logout");
    Cookies.remove("user");
    router.push("/");
  };

  const handleFileInputChange = (event) => {
    setFile(event.target.files[0]);
    console.log("File: ", file);
  };

  const { handleSubmit, control } = useForm();

  const db = getFirestore(app);
  const storage = getStorage(app);

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

  const [papers, setPapers] = useState([]);

  const handleRead = async (id) => {
    try {
      // Retrieve the user value from the cookie
      const user = Cookies.get("user");

      if (!user) {
        console.error("User value not found in the cookie");
        return;
      }

      const papersCollection = collection(db, "papers");
      const paperDocRef = doc(papersCollection, id);

      // Fetch the document to get the current 'read' array
      const paperDocSnapshot = await getDoc(paperDocRef);
      const data = paperDocSnapshot.data();

      if (!data) {
        console.error("Document not found", id);
        return;
      }

      // Check if the user is in the 'read' array
      const isUserInReadArray = data.read.includes(user);

      if (isUserInReadArray) {
        // User is already in the 'read' array, remove them
        await updateDoc(paperDocRef, {
          read: arrayRemove(user),
        });
        toast.success("Marked as unread");
        console.log(`Removed user '${user}' from 'read' array`);
      } else {
        // User is not in the 'read' array, add them
        await updateDoc(paperDocRef, {
          read: arrayUnion(user),
        });
        toast.success("Marked as read");
        console.log(`Added user '${user}' to 'read' array`);
      }
      getPapers();
    } catch (error) {
      console.error("Error updating Firestore document:", error);
    }
  };

  const getPapers = async () => {
    const papersCollection = collection(db, "papers");
    const papersSnapshot = await getDocs(papersCollection);
    const papersList = papersSnapshot.docs.map((doc) => ({
      id: doc.id, // Add the documentId property
      ...doc.data(), // Include the document data
    }));
    console.log("Papers: ", papersList);
    setPapers(papersList);
  };

  const handleDelete = async (id) => {
    try {
      const papersCollection = collection(db, "papers");
      const paperDocRef = doc(papersCollection, id);

      // Get the fileURL from the Firestore document
      const paperDocSnapshot = await getDoc(paperDocRef);
      const paperData = paperDocSnapshot.data();
      const fileURL = paperData.fileURL;

      // Parse the download URL to extract the storage path
      const parts = fileURL.split("/");
      let storagePath = parts[parts.length - 1];
      storagePath = storagePath.split("%2F").join("/");
      storagePath = storagePath.split("?")[0];
      alert(storagePath);

      // Create a reference to the file using the storage path
      const fileRef = storageReference(storage, storagePath);

      // Delete the file using the reference
      await deleteObject(fileRef);
      console.log("File deleted successfully");

      // Delete the Firestore document
      await deleteDoc(paperDocRef);

      console.log("Paper deleted successfully");
      toast.success("Paper deleted successfully");
      getPapers();
    } catch (error) {
      console.error("Error deleting paper: ", error);
      toast.error("Error deleting paper");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Toaster closeButton position="top-right" richColors />
      <ModeToggle />
      <div className="my-2 min-w-full flex flex-row items-center justify-between">
        <h2 className="ml-4 text-2xl font-extrabold tracking-tight lg:text-3xl">
          Research Sync
        </h2>
        <div className="flex gap-4 mr-4">
          <Button
            variant="secondary"
            className="p-4"
            onClick={() => setShowAddPaper(true)}
          >
            Add Paper
          </Button>
          <Button variant="destructive" onClick={() => handleLogOut()}>
            Logout
          </Button>
        </div>
      </div>
      {showAddPaper && (
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
                    <Input
                      {...field}
                      type="number"
                      placeholder="Year"
                      required
                    />
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
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Added</TableHead>
            <TableHead>Read</TableHead>
            <TableHead>Paper Title</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Conference</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>File</TableHead>
            <TableHead>State of Art</TableHead>
            <TableHead>ML/DL</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {papers.map((paper) => (
            <TableRow key={paper.id}>
              <TableCell>
                {paper.added === "fahad" ? (
                  <FahadSir />
                ) : paper.added === "biru" ? (
                  <Biru />
                ) : paper.added === "istiaq" ? (
                  <Istiaq />
                ) : paper.added === "niaz" ? (
                  <Niaz />
                ) : paper.added === "sabrina" ? (
                  <Sabrina />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-row">
                  {paper.read.map((user) => {
                    return user === "fahad" && user != paper.added ? (
                      <FahadSir />
                    ) : user === "biru" && user != paper.added ? (
                      <Biru />
                    ) : user === "istiaq" && user != paper.added ? (
                      <Istiaq />
                    ) : user === "niaz" && user != paper.added ? (
                      <Niaz />
                    ) : user === "sabrina" && user != paper.added ? (
                      <Sabrina />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>{paper.title}</TableCell>
              <TableCell>{paper.year}</TableCell>
              <TableCell>{paper.country}</TableCell>
              <TableCell>{paper.conference}</TableCell>
              <TableCell>{paper.impactFactor}</TableCell>
              <TableCell>
                <Link
                  href={`${paper.link}`}
                  className="text-blue-500 hover:underline"
                >
                  View
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`${paper.fileURL}`}
                  className="text-blue-500 hover:underline"
                >
                  View
                </Link>
              </TableCell>
              <TableCell>{paper.stateOfArt}</TableCell>
              <TableCell>{paper.mlDl}</TableCell>
              <TableCell>
                {paper.added === Cookies.get("user") ? (
                  <Button
                    onClick={() => handleDelete(`${paper.id}`)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                ) : (
                  <Button
                    className="whitespace-nowrap"
                    variant="secondary"
                    onClick={() => handleRead(`${paper.id}`)}
                  >
                    Mark as{" "}
                    {paper.read.includes(Cookies.get("user"))
                      ? "unread"
                      : "read"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Dashboard;
