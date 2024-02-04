import AvatarGenerator from "@/components/createAvatar"
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";

export const columns = [
    {
        accessorKey: "addedBy",
        header: "Added By",
        cell: ({ row }) => {
            return <AvatarGenerator fullname={row.getValue("addedBy")?.fullname} image={row.getValue("addedBy")?.image} />
        },
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
    },
    {
        accessorKey: "publisher",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Publisher" />
        ),
    },
    {
        accessorKey: "year",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Year" />
        ),
    },
    {
        accessorKey: "country",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Country" />
        ),
    },
    {
        accessorKey: "readBy",
        header: "Read By",
        cell: ({ row }) => {
            return (
                <div className="flex flex-row items-center gap-2">
                    {row.original.readBy.map(user => (
                        <AvatarGenerator key={user.id} fullname={user.fullname} image={user.image} />
                    ))}
                </div>
            );
        }

    },
]