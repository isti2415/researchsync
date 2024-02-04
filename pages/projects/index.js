import Header from "@/components/Header";
import { OrganizationList } from "@clerk/nextjs";

const Dashboard = () => {
    return (
        <div className="container mt-4">
            <Header />
            <div className="h-screen pb-32 flex flex-col items-center justify-center">
                <OrganizationList hidePersonal={true} />
            </div>
        </div>
    );
};

export default Dashboard;
