import { useEffect } from "react";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFormik } from "formik";
import { Label } from "@/components/ui/label";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { db, storage } from '@/firebase'
import { setDoc, doc } from "firebase/firestore";
import { useOrganization, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Link from "next/link";

const NewPaper = () => {
    const router = useRouter();

    const organization = useOrganization().organization;
    const user = useUser().user;

    const form = useFormik({
        initialValues: {
            title: "",
            rating: null,
            publisher: "",
            year: null,
            keywords: "",
            country: "",
            notes: null,
            pdf: "",
            link: "",
            comments: null,
        },
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    const handleSubmit = async (values) => {
        let id = uuidv4();
        values.addedBy = {};
        values.addedBy.id = user.id;
        values.addedBy.image = user.imageUrl;
        values.addedBy.fullname = user.fullName;
        values.readBy = [];
        values.comments = [];
        await setDoc(doc(db, "projects", organization.id, "papers", id), values)
            .then(() => {
                toast("Successfully saved changes");
                router.push(`/projects/${organization.slug}/papers/${id}`)
            })
            .catch((error) => {
                // Handle errors if necessary
                toast("Failed to save changes")
            });
    }

    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const uploadFile = () => {
            const name = "papers/" + new Date().getTime() + file?.name;
            const storageRef = ref(storage, name);
            setUploading(true);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on("state_changed", (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploading(progress);
            }, (error) => {
                toast("File not uploaded")
                setFile(null)
                setUploading(false)
                console.log("File upload error:", error)
            },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        form.values.pdf = downloadURL;
                    })
                    toast("File uploaded successfully")
                    setFile(null)
                    setUploading(false)
                }
            )
        }
        if (file) {
            uploadFile();
        }
    }, [file]
    )

    const editor = useEditor({
        extensions: [StarterKit],
        onUpdate: ({ editor }) => {
            form.values.notes = editor.getHTML();
        },
    });

    return (
        <div className="container max-w-screen-6xl mt-4 mb-16">
            <Header />
            <div className="flex flex-col mt-8 gap-4">
                <form onSubmit={form.handleSubmit}>
                    <div className="flex justify-end items-center gap-4">
                        <Link href={`/projects/${organization?.slug}`}><Button variant="destructive">Cancel</Button></Link>
                        <Button type="submit" disabled={uploading}>Save</Button>
                    </div>
                    <Separator className="h-1 my-4" />
                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-col w-full gap-1.5">
                                <Label htmlFor="title" className="font-bold">
                                    Title
                                </Label>
                                <Input
                                    placeholder="Title of the literature"
                                    name="title"
                                    value={form.values.title}
                                    onChange={form.handleChange}
                                    className="border-none"
                                    required
                                />
                            </div>
                            <Separator className="lg:h-auto lg:w-0.5" />
                            <div className="flex flex-col w-full lg:w-1/4 gap-1.5">
                                <Label htmlFor="rating" className="font-bold">
                                    Rating
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Impact of paper out of 5"
                                    name="rating"
                                    className="border-none"
                                    value={form.values.rating}
                                    onChange={form.handleChange}
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-col w-full gap-1.5">
                                <Label htmlFor="publisher" className="font-bold">
                                    Publisher
                                </Label>
                                <Input
                                    placeholder="Publisher of the literature"
                                    name="publisher"
                                    className="border-none"
                                    value={form.values.publisher}
                                    onChange={form.handleChange}
                                />
                            </div>
                            <Separator className="lg:h-auto lg:w-0.5" />
                            <div className="flex flex-col w-full lg:w-1/4 gap-1.5">
                                <Label htmlFor="year" className="font-bold">
                                    Year
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Year of publication"
                                    name="year"
                                    className="border-none"
                                    value={form.values.year}
                                    onChange={form.handleChange}
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-col w-full gap-1.5">
                                <Label htmlFor="keywords" className="font-bold">
                                    Keywords
                                </Label>
                                <Input
                                    placeholder="Comma separated Keywords of the literature"
                                    name="keywords"
                                    className="border-none"
                                    value={form.values.keywords}
                                    onChange={form.handleChange}
                                />
                            </div>
                            <Separator className="lg:h-auto lg:w-0.5" />
                            <div className="flex flex-col w-full lg:w-1/4 gap-1.5">
                                <Label htmlFor="country" className="font-bold">
                                    Country
                                </Label>
                                <Input
                                    placeholder="Country of research"
                                    name="country"
                                    className="border-none"
                                    value={form.values.country}
                                    onChange={form.handleChange}
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col w-full gap-1.5">
                            <Label className="font-bold">Notes</Label>
                            <EditorContent className="border min-h-24" editor={editor} content={form.values.notes} />
                        </div>
                        <Separator />
                        <div className="flex flex-col w-full gap-1.5">
                            <Label className="font-bold">PDF</Label>
                            <Input
                                type="file"
                                className="flex justify-center items-center h-full gap-45"
                                onChange={(e) => {
                                    setFile(e.target.files[0]);
                                }}
                            />
                        </div>
                        <Separator />
                        <div className="flex flex-col w-full gap-1.5">
                            <Label className="font-bold">DOI</Label>
                            <Input
                                placeholder="Link or DOI of Literature"
                                name="link"
                                value={form.values.link}
                                onChange={form.handleChange}
                            />
                        </div>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default NewPaper;
