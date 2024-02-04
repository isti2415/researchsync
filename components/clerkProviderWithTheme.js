import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export function ClerkProviderWithTheme({ children }) {
    const { resolvedTheme } = useTheme();

    const localization = {
        formFieldLabel__organizationName: "Project name",
        organizationSwitcher: {
            notSelected: "No project selected",
            action__createOrganization: "Create project",
            action__manageOrganization: "Manage project",
        },
        organizationProfile: {
            navbar: {
                title: "Project",
                description: "Manage your project.",
            },
            start: {
                headerSubtitle__members: "View and manage project members",
                headerSubtitle__settings: "View and manage project members",
            },
            profilePage: {
                title: "Project Profile",
                subtitle: "Manage your project.",
                successMessage: "The project has been updated.",
                dangerSection: {
                    leaveOrganization: {
                        title: "Leave project",
                        messageLine1:
                            "Are you sure you want to leave this project? You will lose access to all of its resources.",
                        successMessage: "You have left the project.",
                    },
                    deleteOrganization: {
                        title: "Delete project",
                        messageLine1: "Are you sure you want to delete this project?",
                        successMessage: "You have deleted the project.",
                    },
                },
                domainSection: {
                    subtitle:
                        "Allow users to join the project automatically or request to join based on a verified email domain.",
                },
            },
        },
        createDomainPage: {
            subtitle:
                "Add the domain to verify. Users with email addresses at this domain can join the project automatically or request to join.",
        },
        enrollmentTab: {
            verifiedDomainPage: {
                subtitle: "Choose how users from this domain can join the project.",
                manualInvitationOption__label: "No automatic enrollment",
                manualInvitationOption__description:
                    "Users can only be invited manually to the project.",
                automaticInvitationOption__label: "Automatic invitations",
                automaticInvitationOption__description:
                    "Users are automatically invited to join the project when they sign-up and can join anytime.",
                automaticSuggestionOption__label: "Automatic suggestions",
                automaticSuggestionOption__description:
                    "Users receive a suggestion to request to join, but must be approved by an admin before they are able to join the project.",
            },
        },
        invitePage: {
            subtitle: "Invite users to join the project.",
        },
        removeDomainPage: {
            messageLine2:
                "Users won't be able to join the project automatically after this.",
        },
        membersPage: {
            invitationsTab: {
                autoInvitations: {
                    headerSubtitle:
                        "Invite users by connecting an email domain with your project. Anyone who signs up with a matching email domain will be able to join the project anytime.",
                },
            },
            requestsTab: {
                requests: {
                    headerSubtitle:
                        "Browse and manage users who requested to join the project.",
                },
                autoSuggestions: {
                    headerSubtitle:
                        "Users who sign up with a matching email domain, will be able to see a suggestion to request to join your organization.",
                },
            },
        },
        createOrganization: {
            title: "Create project",
            formButtonSubmit: "Create project",
        },
        organizationList: {
            createOrganization: "Create project",
            titleWithoutPersonal: "Choose a project",
            action__createOrganization: "Create project",
        },
    };

    return <ClerkProvider
        localization={localization}
        appearance={{
            baseTheme: resolvedTheme === "dark" ? dark : undefined,
        }}
    >
        {children}
    </ClerkProvider>
}