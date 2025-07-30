import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChartLineFill, PeopleFill } from 'react-bootstrap-icons';

export default function DashboardPage() {
    const { user } = useAuth();
    
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-1">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-lg text-gray-500">Select a module to start working.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link to="/prospects" className="group block p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <div className="flex items-center mb-4">
                        <BarChartLineFill size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <h5 className="ml-4 text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Prospects</h5>
                    </div>
                    <p className="text-gray-600 text-base">Manage and track all loan prospects from pre-validation to closing.</p>
                </Link>
                <Link to="/credits" className="group block p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <div className="flex items-center mb-4">
                        <PeopleFill size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <h5 className="ml-4 text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Credits</h5>
                    </div>
                    <p className="text-gray-600 text-base">View and manage finalized clients and their disbursed loans.</p>
                </Link>
                <Link to="/lenders" className="group block p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <div className="flex items-center mb-4">
                        <PeopleFill size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <h5 className="ml-4 text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Lenders</h5>
                    </div>
                    <p className="text-gray-600 text-base">Manage and track third-party funding sources.</p>
                </Link>
            </div>
        </div>
    );
}