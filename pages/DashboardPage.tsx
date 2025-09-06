import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Header from '../components/Header';
import { ProspectsIcon, CreditsIcon, LendersIcon } from '../components/icons';

const ModuleCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="bg-blue-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-500 mt-1">{description}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const modules = [
        {
            title: "Prospects",
            description: "Manage and track all loan prospects from pre-validation to closing.",
            icon: ProspectsIcon,
        },
        {
            title: "Credits",
            description: "View and manage finalized clients and their disbursed loans.",
            icon: CreditsIcon,
        },
        {
            title: "Lenders",
            description: "Manage and track third-party funding sources.",
            icon: LendersIcon,
        },
    ];

    return (
        <DashboardLayout>
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, index) => (
                    <ModuleCard key={index} title={module.title} description={module.description} icon={module.icon} />
                ))}
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;