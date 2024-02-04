import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const AvatarGenerator = ({ fullname, image }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <Avatar>
                    <AvatarImage src={image} />
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                {fullname}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export default AvatarGenerator;