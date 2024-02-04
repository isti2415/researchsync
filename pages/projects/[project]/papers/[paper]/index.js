import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eye, EyeOff, Loader2Icon, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { db } from '@/firebase'
import { Timestamp, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { clerkClient, useOrganization, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AvatarGenerator from "@/components/createAvatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
const Paper = () => {
  const router = useRouter();

  const organization = useOrganization().organization;
  const user = useUser().user;
  const [paper, setPaper] = useState([]);
  const [readByUsers, setReadByUsers] = useState([]);
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (organization) {
      const unsubscribe = onSnapshot(doc(db, "projects", organization.id, "papers", router.query.paper), (doc) => {
        setPaper(doc.data());
        setReadByUsers(doc.data().readBy);
        setComments(doc.data().comments);
      })
      return () => unsubscribe();
    }
  }, [organization]);

  const convertTextToBadges = (text) => {
    if (text) {
      const keywords = text.split(",");
      return keywords.map((keyword, index) => (
        <Badge key={index}>{keyword}</Badge>
      ));
    }
  };

  const convertNumberToStars = (rating) => {
    if (rating) {
      const filledStars = Array.from({ length: rating }, (_, i) => <FaStar key={`star-${i}`} />);
      const emptyStars = Array.from({ length: 5 - rating }, (_, i) => <FaRegStar key={`empty-star-${i}`} />);

      return [...filledStars, ...emptyStars];
    } else {
      const emptyStars = Array.from({ length: 5 }, (_, i) => <FaRegStar key={`empty-star-${i}`} />);
      return [...emptyStars];
    }
  };

  const handleDelete = () => {
    deleteDoc(doc(db, "projects", organization.id, "papers", router.query.paper))
      .then(() => {
        router.push(`/projects/${organization.slug}`);
      })
      .catch((error) => {
        toast("Failed to delete paper.");
      });
  };

  const handleCommentDelete = async ({ commentId }) => {
    try {
      // Check if commentId is truthy
      if (!commentId) {
        console.error("Comment ID is missing.");
        return;
      }

      const newComments = comments.filter(comment => comment.id !== commentId);

      // Update only the readBy field in the document
      await updateDoc(doc(db, "projects", organization.id, "papers", router.query.paper), {
        comments: newComments,
      });

      toast("Deleted comment");
      setComments(newComments);
    } catch (error) {
      // Handle errors if necessary
      console.error("Failed to delete comment:", error);
      toast("Failed to delete comment");
    }
  };

  const [isRead, setIsRead] = useState(false);
  const [readBy, setReadBy] = useState({})

  useEffect(() => {
    if (paper && user && Array.isArray(paper.readBy)) {
      setReadBy({
        id: user.id,
        image: user.imageUrl,
        fullname: user.fullName
      })
      setIsRead(paper.readBy.some(item => (
        item.id === readBy.id &&
        item.image === readBy.image &&
        item.fullname === readBy.fullname
      )));
    }
  }, [paper, user]);

  const markAsRead = async () => {
    if (paper.readBy.some(item => (
      item.id === readBy.id &&
      item.image === readBy.image &&
      item.fullname === readBy.fullname
    ))) {
      // User has already read or paper.readBy is not an array
      return;
    }

    try {
      paper.readBy.push(readBy);
      // Update only the readBy field in the document
      await updateDoc(doc(db, "projects", organization.id, "papers", router.query.paper), {
        readBy: paper.readBy,
      });

      toast("Marked as Read");
      setReadByUsers(paper.readBy)
    } catch (error) {
      // Handle errors if necessary
      console.error("Failed to save changes:", error);
      toast("Failed to mark as Read");
    }
  };

  const markAsUnread = async () => {

    if (!paper.readBy.some(item => (
      item.id === readBy.id &&
      item.image === readBy.image &&
      item.fullname === readBy.fullname
    ))) {
      // User hasn't read or paper.readBy is not an array
      return;
    }

    try {
      paper.readBy = paper.readBy.filter(item => (
        item.id !== readBy.id ||
        item.image !== readBy.image ||
        item.fullname !== readBy.fullname
      ));

      // Update only the readBy field in the document
      await updateDoc(doc(db, "projects", organization.id, "papers", router.query.paper), {
        readBy: paper.readBy,
      });

      toast("Marked as Unread");
      setReadByUsers(paper.readBy)
    } catch (error) {
      // Handle errors if necessary
      console.error("Failed to save changes:", error);
      toast("Failed to mark as Unread");
    }
  };

  const [comment, setComment] = useState("");

  const handleComment = async (event) => {

    event.preventDefault();

    let commentDetails = {}
    let id = uuidv4();
    commentDetails.id = id;
    commentDetails.comment = comment;
    commentDetails.fullname = user.fullName;
    commentDetails.image = user.imageUrl;
    const currentDate = new Date();
    const formattedDateTime = format(currentDate, 'h:mm a dd/MM/yyyy')
    commentDetails.timestamp = formattedDateTime;

    console.log(commentDetails);

    try {
      paper.comments.push(commentDetails);
      // Update only the readBy field in the document
      await updateDoc(doc(db, "projects", organization.id, "papers", router.query.paper), {
        comments: paper.comments,
      });

      toast("Added a comment");
      setComments(paper.comments)
      setComment("")
    } catch (error) {
      // Handle errors if necessary
      console.error("Failed to save changes:", error);
      toast("Failed to mark as Read");
      setComment("")
    }
  }

  if (!paper || !organization || !user) {
    return (
      <div className="fixed bottom-4 left-4 z-20">
        <Button variant="outline" size="icon">
          <Loader2Icon className="h-[1.2rem] w-[1.2rem] animate-spin transition-all" />
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-6xl mt-4 mb-8">
      <Header />
      <div className="flex flex-col mt-8 gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span>Added By:</span>
              <AvatarGenerator fullname={paper.addedBy?.fullname} image={paper.addedBy?.image} />
            </div>
            <div className="flex items-center gap-4">
              <span>Read By:</span>
              {readByUsers && readByUsers.map(user => (
                <AvatarGenerator key={user.id} fullname={user.fullname} image={user.image} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {!isRead ? (
                        <div className={`${buttonVariants({
                          size: "sm",
                          variant: "destructive",
                        })}`}>
                          <EyeOff className="mr-2" />
                          Unread
                        </div>
                      ) : (
                        <div className={`${buttonVariants({
                          size: "sm",
                        })} bg-green-600 hover:bg-green-700`}>
                          <Eye className="mr-2" />
                          Read
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      Click to change status
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={markAsRead}>Mark as Read</DropdownMenuItem>
                <Separator className="my-2" />
                <DropdownMenuItem onClick={markAsUnread}>Mark as Unread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {paper.addedBy?.id == user.id && (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className={`${buttonVariants({
                      size: "sm",
                      variant: "destructive",
                    })} hover:cursor-pointer`}>Delete</div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your paper
                        and remove the data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row items-center justify-between">
                      <DialogClose asChild>
                        <Button type="button">Cancel</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link href={`/projects/${organization?.slug}/papers/${router.query.paper}/edit`}><Button className="w-full" size="sm" type="button">Edit</Button></Link>
              </div>
            )}
          </div>
        </div>
        <Separator className="h-1 my-4" />
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col w-full gap-1.5">
              <Label htmlFor="title" className="font-bold">
                Title
              </Label>
              <p>{paper.title}</p>
            </div>
            <Separator className="lg:h-auto lg:w-0.5" />
            <div className="flex flex-col w-full lg:w-1/4 gap-1.5">
              <Label htmlFor="rating" className="font-bold">
                Rating
              </Label>
              <div className="flex items-center">
                {convertNumberToStars(paper.rating)}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col w-full gap-1.5">
              <Label htmlFor="publisher" className="font-bold">
                Publisher
              </Label>
              <p>{paper.publisher}</p>
            </div>
            <Separator className="lg:h-auto lg:w-0.5" />
            <div className="flex flex-col w-full lg:w-1/4 gap-1.5">
              <Label htmlFor="year" className="font-bold">
                Year
              </Label>
              <p>{paper.year}</p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col w-full gap-1.5">
              <Label htmlFor="keywords" className="font-bold">
                Keywords
              </Label>
              <div className="space-x-2 space-y-2">
                {convertTextToBadges(paper.keywords)}
              </div>
            </div>
            <Separator className="lg:h-auto lg:w-0.5" />
            <div className="flex flex-col w-full lg:w-1/4 gap-1.5">
              <Label htmlFor="country" className="font-bold">
                Country
              </Label>
              <p>{paper.country}</p>
            </div>
          </div>
          <Separator />
          <Accordion type="multiple" collapsible="true">
            <AccordionItem value="notes">
              <AccordionTrigger className="hover:no-underline">
                <Label className="font-bold">Notes</Label>
              </AccordionTrigger>
              <AccordionContent>
                <div className="border min-h-24" dangerouslySetInnerHTML={{ __html: paper.notes }} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pdf">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex justify-between w-full items-center gap-2">
                  <Label className="font-bold">PDF</Label>
                  {paper.link && <Link
                    href={paper.link}
                    className={`${buttonVariants({
                      size: "sm",
                      variant: "secondary",
                    })} mr-8`}
                  >
                    DOI
                    <MoveUpRight className="h-4 w-4" />
                  </Link>}
                </div>
              </AccordionTrigger>
              <AccordionContent
                className="w-full"
              >
                {paper.pdf &&
                  <iframe
                    className="w-full aspect-[7/9]"
                    src={paper.pdf}
                    allowFullScreen={true}
                  />
                }
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="comments">
              <AccordionTrigger className="hover:no-underline">
                <Label className="font-bold">Comments</Label>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {comments?.map((comment, index) => (
                    <Card key={index}>
                      <CardHeader className="pl-0 ml-4 w-auto">
                        <CardTitle className="text-md lg:text-lg">
                          {comment.comment}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                        <div className="flex items-center gap-4">
                          <AvatarGenerator fullname={comment.fullname} image={comment.image} />
                          <CardTitle className="text-md lg:text-lg">
                            {comment.fullname}
                          </CardTitle>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <CardDescription>{comment.timestamp}</CardDescription>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className={`${buttonVariants({
                                  size: "sm",
                                  variant: "ghost",
                                })} mr-8 hover:bg-destructive`}>Delete</div>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                                  <DialogDescription>
                                    This action cannot be undone. This will permanently delete your comment
                                    and remove the data from our servers.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex flex-row items-center justify-between">
                                  <DialogClose asChild>
                                    <Button type="button">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleCommentDelete({ commentId: comment.id })}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                  <Card>
                    <form onSubmit={handleComment}>
                      <CardHeader className="pl-0 ml-4 w-auto">
                        <Textarea
                          placeholder="Write a comment..."
                          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                          value={comment}
                          onChange={(e) => {
                            setComment(e.target.value);
                          }}
                          required
                        />
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <AvatarGenerator fullname={user.fullName} image={user.imageUrl} />
                          <CardTitle className="text-md lg:text-lg">
                            {user.fullName}
                          </CardTitle>
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                          Comment
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Paper;
