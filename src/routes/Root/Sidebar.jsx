import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import useMenuItems from "./MenuItems"; // Ensure correct import path

// 💡 Import both logo versions
import Logo from "../../assets/Logo/logo.png";
import Logo_Dark from "../../assets/Logo/logo_dark.png"; 


const AccordionItem = ({ item, isSidebarOpen, mode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Check if any child route is currently active
    const isChildActive = item.list?.some(child => location.pathname === child.path);
    
    // Auto-open if child is active
    React.useEffect(() => {
        if (isChildActive) setIsOpen(true);
    }, [isChildActive]);

    // Parent is highlighted ONLY if a child route is active (or if it's a flat link that's active)
    const isParentActive = isChildActive;

    // --- RECURSIVE LOGIC START ---
    if (item.list) {
        return (
            <li className="my-1.5">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                        isParentActive 
                            ? "bg-primary text-white shadow-md" 
                            : "bg-transparent text-base-content/80 hover:bg-base-200 dark:hover:bg-gray-800"
                    }`}
                >
                    {/* Active Left Indicator Bar */}
                    {isParentActive && (
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"></div>
                    )}

                    <div className="flex items-center gap-3 ml-1">
                        {/* Icon Wrapper */}
                        <div className={`${isParentActive ? "text-white" : "text-base-content/60 group-hover:text-primary transition-colors"}`}>
                            {item.icon}
                        </div>
                        {isSidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.title}</span>}
                    </div>
                    
                    {isSidebarOpen && (
                        <MdChevronRight 
                            className={`transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"} ${isParentActive ? "text-white/80" : "text-base-content/50"}`} 
                            size={20}
                        />
                    )}
                </button>
                
                {/* Render Children with Smooth Grid Transition */}
                {isSidebarOpen && (
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                        <ul className="overflow-hidden space-y-1">
                            {item.list.map((child) => {
                                const isChildCurrent = location.pathname === child.path;
                                return (
                                    <li key={child.title} className="w-full">
                                        <Link
                                            to={child.path}
                                            className={`flex px-4 py-2.5 ml-6 mr-2 rounded-lg gap-3 items-center transition-colors duration-200 ${
                                                isChildCurrent 
                                                    ? "bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary" 
                                                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <div className={`${isChildCurrent ? "text-primary" : "text-base-content/50"}`}>
                                                {child.icon}
                                            </div>
                                            <span className="text-sm font-medium">{child.title}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </li>
        );
    } 
    // --- RECURSIVE LOGIC END ---

    else {
        // Flat Links (No children)
        const isActive = location.pathname === item.path;
        
        return (
            <li className="my-1.5">
                <Link
                    to={item.path}
                    className={`w-full flex p-3 rounded-xl transition-all duration-200 items-center gap-3 relative overflow-hidden group ${
                        isActive 
                            ? "bg-primary text-white shadow-md" 
                            : "bg-transparent text-base-content/80 hover:bg-base-200 dark:hover:bg-gray-800"
                    }`}
                >
                    {isActive && (
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"></div>
                    )}
                    <div className={`ml-1 ${isActive ? "text-white" : "text-base-content/60 group-hover:text-primary transition-colors"}`}>
                        {item.icon}
                    </div>
                    {isSidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.title}</span>}
                </Link>
            </li>
        );
    }
};

const Sidebar = ({ isSidebarOpen, toggleSidebar, mode }) => {
    // Get menu items
    const menuItems = useMenuItems();
    
    // Using your 'secondary' background color for the main sidebar
    const sidebarClasses = `
        fixed top-0 left-0 h-full shadow-lg z-30 transition-all duration-300 flex flex-col
        bg-base-100 border-r border-base-200
        ${isSidebarOpen
            ? 'w-64 translate-x-0' 
            : 'w-64 -translate-x-full md:w-[85px] md:translate-x-0'
        }
    `;

    const currentLogo = mode === 'dark' ? Logo_Dark : Logo;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                onClick={toggleSidebar}
                className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            ></div>

            {/* Sidebar Container */}
            <div className={sidebarClasses}>
                
                {/* Custom Top Header Card (Matching your image) */}
                <div className={`m-3 mt-4 mb-2 p-3 rounded-xl shadow-md transition-all flex items-center gap-3 
                    bg-primary text-white
                    ${!isSidebarOpen && 'justify-center p-2'}
                `}>
                    <div className="bg-white p-1 rounded-lg flex-shrink-0 shadow-sm">
                        <img 
                            src={currentLogo} 
                            alt="Logo" 
                            className={`transition-all duration-300 object-contain ${isSidebarOpen ? 'w-10 h-10' : 'w-8 h-8'}`} 
                        />
                    </div>
                    
                    {isSidebarOpen && (
                        <div className="flex flex-col truncate">
                            <span className="font-bold text-[15px] leading-tight text-white drop-shadow-sm"> School Manegment </span>
                            <span className="text-xs text-white/90 font-medium">Owner</span>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
                    <ul>
                        {menuItems.map((item) => (
                            <AccordionItem 
                                key={item.title} 
                                item={item} 
                                isSidebarOpen={isSidebarOpen} 
                                mode={mode} 
                            />
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;