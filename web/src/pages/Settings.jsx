import { ArrowLeft, LogOut, Bell, Shield, HelpCircle, Info } from 'lucide-react';
import { logout } from '../api/auth';

export default function Settings({ user, onBack, onLogout }) {
    const handleLogout = () => {
        logout();
        onLogout();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Account Info */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Account Information</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-500">Name</label>
                            <p className="text-gray-900 font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <p className="text-gray-900 font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">University</label>
                            <p className="text-gray-900 font-medium">{user?.university}</p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Notifications</span>
                        </div>
                        <span className="text-sm text-gray-500">Coming soon</span>
                    </button>

                    <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Privacy & Safety</span>
                        </div>
                        <span className="text-sm text-gray-500">Coming soon</span>
                    </button>
                </div>

                {/* Support */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Help & Support</span>
                        </div>
                    </button>

                    <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">About UniCycle</span>
                        </div>
                        <span className="text-sm text-gray-500">v1.0.0</span>
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </div>
    );
}