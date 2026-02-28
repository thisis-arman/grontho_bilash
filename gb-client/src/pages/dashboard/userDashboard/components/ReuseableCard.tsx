import React, { ReactNode } from 'react';

interface ReuseableCardProps {
    title: string;
    icon: ReactNode;
    amount: string | number;
    stat?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const ReuseableCard: React.FC<ReuseableCardProps> = ({ title, icon, amount, stat, trend = 'neutral' }) => {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 tracking-wide">{title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{amount}</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    {icon}
                </div>
            </div>
            {stat && (
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                        trend === 'up' ? 'text-emerald-600' :
                        trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                        {stat}
                    </span>
                    <span className="text-sm text-gray-400">from last month</span>
                </div>
            )}
        </div>
    );
};

export default ReuseableCard;