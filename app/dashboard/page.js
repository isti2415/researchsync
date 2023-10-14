"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageReference,
  deleteObject,
} from "firebase/storage";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import app from "@/firebase";
import { ModeToggle } from "@/components/mode-toggle";
import AddPaper from "./addPaper";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FahadSir from "@/components/avatars/fahad-sir";
import Biru from "@/components/avatars/biru";
import Istiaq from "@/components/avatars/istiaq";
import Niaz from "@/components/avatars/niaz";
import Sabrina from "@/components/avatars/sabrina";
import Link from "next/link";
import EditPaper from "./editPaper";

const Dashboard = () => {
  const router = useRouter();
  const [showAddPaper, setShowAddPaper] = useState(false);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const [papers, setPapers] = useState([]);
  const user = Cookies.get("user");

  const handleLogOut = () => {
    Cookies.remove("user");
    router.push("/");
  };

  const [showEditPaper, setShowEditPaper] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const getUserAvatar = (user, added, paper) => {
    if (user === added) {
      return (
        <div className="flex flex-row gap-2">
          <Button onClick={() => {
            setShowEditPaper(true);
            setSelectedPaper(paper);
          } } variant="secondary">
            Edit
          </Button>
          <Button onClick={() => handleDelete(paper.id)} variant="destructive">
            Delete
          </Button>
        </div>
      );
    }

    return (
      <Button
        className="whitespace-nowrap"
        variant="secondary"
        onClick={() => handleRead(paper.id)}
      >
        Mark as {paper.read.includes(user) ? "unread" : "read"}
      </Button>
    );
  };

  const handleRead = async (id) => {
    try {
      if (!user) {
        console.error("User value not found in the cookie");
        return;
      }

      const papersCollection = collection(db, "papers");
      const paperDocRef = doc(papersCollection, id);
      const paperDocSnapshot = await getDoc(paperDocRef);
      const data = paperDocSnapshot.data();

      if (!data) {
        console.error("Document not found", id);
        return;
      }

      const isUserInReadArray = data.read.includes(user);

      if (isUserInReadArray) {
        await updateDoc(paperDocRef, {
          read: arrayRemove(user),
        });
        toast.success("Marked as unread");
        console.log(`Removed user '${user}' from 'read' array`);
      } else {
        await updateDoc(paperDocRef, {
          read: arrayUnion(user),
        });
        toast.success("Marked as read");
        console.log(`Added user '${user}' to 'read' array`);
      }
    } catch (error) {
      console.error("Error updating Firestore document:", error);
      toast.error("Error updating Firestore document");
    }
  };

  const handleDelete = async (id) => {
    try {
      const papersCollection = collection(db, "papers");
      const paperDocRef = doc(papersCollection, id);
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

  useEffect(() => {
    const user = Cookies.get("user");
    let unsubscribe;

    if (user) {
      const papersCollection = collection(db, "papers");
      unsubscribe = onSnapshot(papersCollection, (snapshot) => {
        const papersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPapers(papersList);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
          <Button variant="destructive" onClick={handleLogOut}>
            Logout
          </Button>
        </div>
      </div>
      {showAddPaper && <AddPaper setShowAddPaper={setShowAddPaper} />}
      {showEditPaper && <EditPaper setShowEditPaper={setShowEditPaper} selectedPaper={selectedPaper} />}
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
            <TableHead>Summary</TableHead>
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
              <TableCell>{paper.summary}</TableCell>
              <TableCell>
                {getUserAvatar(Cookies.get("user"), paper.added, paper)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Dashboard;
