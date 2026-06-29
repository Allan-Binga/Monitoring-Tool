import {
    Activity,
    LayoutDashboard,
    Bell,
    Settings,
    Container,
    Database,
    Grip,
    Home
} from "lucide-react"

import { NavLink } from "react-router-dom"

function Sidebar({ isOpen, setIsOpen }) {
    const navItems = [
        {
            label: "Home",
            icon: Home,
            path: "/"
        },
        {
            label: "Applications",
            icon: Grip,
            path: "/apps/pm2"
        },
        {
            label: "Docker",
            icon: Container,
            path: "/apps/docker"
        },
        {
            label: "Databases",
            icon: Database,
            path: "/databases"
        },
        {
            label: "Alerts",
            icon: Bell,
            path: "/alerts",
            badge: 12
        }
        // {
        //     label: "Settings",
        //     icon: Settings,
        //     path: "/settings"
        // }
    ]

    return (
        <>
            {/* Overlay (mobile only) */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isOpen ? "block" : "hidden"
                    }`}
            />

            <aside
                className={`
                    fixed top-0 left-0 h-screen z-50
                    w-64 bg-white border-r border-gray-300
                    transform transition-transform duration-300

                    md:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Brand */}
                <div className="h-14 flex items-center px-6 gap-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-sky-800 rounded flex items-center justify-center">
                        <Activity size={16} className="text-white" />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-bold">
                            Skirill Monitor
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">
                            Infrastructure v2.4
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 mt-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                onClick={() => setIsOpen(false)} // close on mobile
                                className={({ isActive }) =>
                                    `
                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                    ${isActive
                                        ? "bg-sky-100 text-sky-900 font-semibold"
                                        : "text-gray-800 hover:bg-sky-50 hover:text-sky-900"
                                    }
                                `
                                }
                            >
                                <Icon size={16} />

                                <span className="text-sm">
                                    {item.label}
                                </span>

                                {item.badge && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}

export default Sidebar