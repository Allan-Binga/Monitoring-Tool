import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar remains fixed/responsive globally */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 min-w-0">
                {/* 
                  Mobile Header: Shows ONLY on screens smaller than 'md'.
                  Ensures small phones always have an easy way to open the sidebar.
                */}
                <header className="h-14 border-b border-gray-300 bg-white px-4 flex items-center md:hidden sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 border border-gray-300 rounded-sm hover:bg-gray-50"
                    >
                        ☰
                    </button>
                    <span className="ml-3 font-semibold text-sm text-gray-800">Skirill Monitor</span>
                </header>

                {/* Page Content Injector */}
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout