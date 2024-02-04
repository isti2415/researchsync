// Header.js
import React from "react";
import { OrganizationSwitcher, UserButton, clerkClient, useOrganization } from "@clerk/nextjs";
import { db } from "@/firebase";
import {
  setDoc,
  collection,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/router";

const Header = () => {
  const organization = useOrganization().organization;
  const router = useRouter();

  useEffect(() => {
    createOrganization();
  }, [organization]);

  const deleteOrganization = async () => {
    try {
      await clerkClient.organizations.deleteOrganization(organization.id);
      // Additional logic after successfully deleting the organization, if needed
    } catch (deleteError) {
      // Handle the error from organization deletion, if needed
    }
  };

  const createOrganization = async () => {
    if (!organization) return;
    const newOrganization = {
      title: organization.name,
      slug: organization.slug,
    };

    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("slug", "==", organization.slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      return;
    }

    try {
      const results = await setDoc(
        doc(db, "projects", organization.id),
        newOrganization
      );
    } catch (error) {
      deleteOrganization();
    }
  };

  return (
    <div id="header" className={router.query.paper ? "flex justify-between items-center" : "flex justify-end items-center"}>
      <a href={`/projects/${organization?.slug}`} className={router.query.paper ? "block" : "hidden"}>
        <Button variant="ghost">
          <Undo2 className="mr-2" />
          Back
        </Button>
      </a>
      <div className="flex items-center justify-center gap-4">
        <OrganizationSwitcher
          afterCreateOrganizationUrl={(org) => `/projects/${org.slug}`}
          afterLeaveOrganizationUrl={"/dashboard"}
          afterSelectOrganizationUrl={(org) => `/projects/${org.slug}`}
          afterSelectPersonalUrl={"/dashboard"}
          hidePersonal={true}
        />
        <UserButton
          afterSignOutUrl="/"
        />
      </div>
    </div>
  );
};

export default Header;
