import { getAdminUserDetails } from "@/lib/actions/admin-details.actions";
import UserDetailsClient from "./_components/user-details-client";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function UserDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getAdminUserDetails(id);

    return (
        <UserDetailsClient data={data} />
    );
}
