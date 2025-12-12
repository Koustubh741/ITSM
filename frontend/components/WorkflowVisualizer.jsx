import React from 'react';
import { UserPlus, FileCheck, ShoppingCart, Truck, UserCheck, ArrowRight } from 'lucide-react';

const WorkflowVisualizer = () => {
    const steps = [
        {
            id: 1,
            title: "Onboarding",
            description: "Asset Request Initiated",
            icon: UserPlus,
            color: "blue",
            assigned: "Requester"
        },
        {
            id: 2,
            title: "Approval",
            description: "Manager/IT Validation",
            icon: FileCheck,
            color: "purple",
            assigned: "Manager"
        },
        {
            id: 3,
            title: "Procurement",
            description: "PO Generation & Order",
            icon: ShoppingCart,
            color: "amber",
            assigned: "Finance/Procurement"
        },
        {
            id: 4,
            title: "Receiving",
            description: "Asset Arrival & Tagging",
            icon: Truck,
            color: "indigo",
            assigned: "IT Admin"
        },
        {
            id: 5,
            title: "Assignment",
            description: "Handover to User",
            icon: UserCheck,
            color: "emerald",
            assigned: "IT Support"
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
            emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="glass-panel p-6 w-full overflow-x-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Asset Management Lifecycle</h3>
                    <p className="text-slate-400 text-sm">Standard operational workflow for new assets</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                    Active Workflow
                </div>
            </div>

            <div className="relative flex items-center justify-between min-w-[800px] pt-4 pb-2">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 -translate-y-6 z-0 rounded-full"></div>

                {steps.map((step, index) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 group">
                        {/* Circle */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md transition-all duration-300 transform group-hover:scale-110 shadow-lg ${getColorClasses(step.color)} mb-4`}>
                            <step.icon size={24} strokeWidth={1.5} />
                        </div>

                        {/* Text Content */}
                        <div className="text-center space-y-1">
                            <h4 className="text-white font-semibold text-sm">{step.title}</h4>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{step.assigned}</p>
                            <p className="text-slate-400 text-xs max-w-[120px] leading-tight">{step.description}</p>
                        </div>

                        {/* Connecting Arrow for all but last */}
                        {index !== steps.length - 1 && (
                            <div className="absolute top-5 -right-[50%] translate-x-1/2 text-slate-700">
                                <ArrowRight size={16} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowVisualizer;
