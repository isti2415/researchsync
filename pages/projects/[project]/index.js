import { useOrganization, clerkClient } from "@clerk/nextjs";
import Header from "@/components/Header"; ``
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/router";
import { Loader2Icon } from "lucide-react";
import { DataTable } from "../../../components/ui/data-table/data-table";
import { columns } from "@/components/paper-columns";

const Project = () => {
  const organization = useOrganization().organization;
  const router = useRouter();
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    if (organization) {
      const q = query(collection(db, "projects", organization.id, "papers"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const papersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPapers(papersData);
      });

      // Cleanup function to unsubscribe when the component unmounts
      return () => unsubscribe();
    }
  }, [organization]);


  if (!papers || !organization) {
    return (
      <div className="fixed bottom-4 left-4 z-20">
        <Button variant="outline" size="icon">
          <Loader2Icon className="h-[1.2rem] w-[1.2rem] animate-spin transition-all" />
        </Button>
      </div>
    );
  }


  return (
    <div className="container mt-4">
      <Header />
      <div className="flex flex-col mt-4 gap-4">
        <div className="text-xl font-bold">{organization?.name}</div>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="Details">
            <AccordionTrigger>About the project</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <div className="text-lg">Coming soon...</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="Notes">
            <AccordionTrigger>Notes</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <div className="text-lg">Coming soon...</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="Papers">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <div>Papers</div>
                <Link href={`/projects/${organization?.slug}/papers/new`} className={cn("mr-4", buttonVariants({ variant: "outline" }))}>
                  Add Paper
                </Link>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <DataTable columns={columns} data={papers} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div >
  );
};

export default Project;
