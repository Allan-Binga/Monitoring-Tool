import Sidebar from "../components/Sidebar"
import ContainerDrawer from "../components/ContainerDrawer"
import { LucideRotateCcwSquare, Search, Grip, CircleCheckIcon, CircleX, Cpu, LucideListFilter, EllipsisVerticalIcon, Ship, PackagePlusIcon, EthernetPort, Square, Eye, Play, RotateCw, ChevronLeft, ChevronRight, Trash2, ListFilterIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { endpoint } from "../api"
import { restartContainer, stopContainer, startContainer } from "../api/docker"
import axios from "axios"

function DockerApps() {
    const [containers, setContainers] = useState([])
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [selectedContainerId, setSelectedContainerId] = useState(null)
    const [selectedAction, setSelectedAction] = useState(null)
    const [selectedContainer, setSelectedContainer] = useState(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false)
    const [summary, setSummary] = useState({
        runningApps: 0,
        stoppedApps: 0,
        createdApps: 0,
        exposedPorts: 0
    })

    // Helper to truncate long text strings
    const truncateText = (text, maxLength = 15) => {
        if (!text) return "-"
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }

    //Prevent Row From Clicking
    const openActionModal = (
        e, container, action
    ) => {
        e.stopPropagation()

        setSelectedContainer(container)
        setSelectedAction(action)
        setConfirmModalOpen(true)
    }

    //Container Detals Drawer
    const handleViewContainer = (container) => {
        setSelectedContainerId(container.id)
        setIsDrawerOpen(true)
    }

    //Docker Apps API & useEffect
    const fetchContainers = async () => {
        try {
            setLoading(true)

            const response = await axios.get(`${endpoint}/docker/apps`)

            setContainers(response.data.apps)
            setSummary(response.data.summary)

            // FIX: Log the actual response data, not the state variable
            // console.log(response.data.summary)
            // console.log(response.data.apps)

        } catch (error) {
            console.error(error)
            // alert("Failed to fetch apps.")
        } finally {
            setLoading(false)
        }
    }

    //Fetch containers useEffect
    useEffect(() => {
        fetchContainers()
    }, [])

    //Container State Styles
    const getStatusStyles = (state) => {
        switch (state) {
            case "running":
                return "bg-green-50 text-green-700"

            case "exited":
                return "bg-red-50 text-red-700"

            case "created":
                return "bg-amber-50 text-amber-700"

            default:
                return "bg-gray-50 text-gray-700"
        }
    }

    // Format Date to relative time (e.g., '3 days ago')
    const formatDate = (timestamp) => {
        if (!timestamp) return "-"

        // Convert Unix timestamp (seconds) to milliseconds
        const ms = timestamp * 1000
        const now = Date.now()
        const diffInSeconds = Math.floor((now - ms) / 1000)

        // Handle future dates or exact clock synchronization offsets safely
        if (diffInSeconds < 5) return "Just now"

        // Under 1 minute
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`
        }

        // Under 1 hour
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
        }

        // Under 24 hours
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
        }

        // Under 30 days
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 30) {
            return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
        }

        // Months representation
        const diffInMonths = Math.floor(diffInDays / 30)
        return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
    }

    //Ports Rendering
    const renderPorts = (ports) => {
        if (!ports?.length) return "-"

        return ports
            .map(
                (p) =>
                    `${p.PublicPort ?? "-"} → ${p.PrivatePort}`
            )
            .join(", ")
    }

    //Container Filtering
    const filteredContainers = containers.filter((container) => {
        const matchesSearch =
            container.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            container.image
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

        const matchesFilter =
            filter === "all"
                ? true
                : container.state === filter

        return matchesSearch && matchesFilter
    })

    //Dynamic Button Rendering
    const filterButtonClass = (value) =>
        `px-4 py-1.5 rounded-sm font-medium text-xs transition-colors ${filter === value
            ? "text-gray-500 bg-white cursor-pointer"
            : "text-gray-600 bg-gray-100 hover:bg-gray-100 cursor-pointer"
        }`

    //Items Per Container Page
    const ITEMS_PER_PAGE = 10

    //Pages Calculation
    const totalPages = Math.ceil(
        filteredContainers.length / ITEMS_PER_PAGE
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    const displayedContainers = filteredContainers.slice(
        startIndex,
        endIndex
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filter])

    //Paginations
    //Next
    const goNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    //Previous
    const goPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }

    //Container Actions Handler: Start, Restart and Stop
    const handleContainerAction = async () => {
        if (!selectedContainer || !selectedAction)
            return

        try {
            setActionLoading(true)

            switch (selectedAction) {
                case "start":
                    await startContainer(selectedContainer.id)
                    break

                case "stop":
                    await stopContainer(selectedContainer.id)
                    break

                case "restart":
                    await restartContainer(selectedContainer.id)
                    break

                default:
                    break
            }

            await fetchContainers()

            setConfirmModalOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <ContainerDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} containerId={selectedContainerId} onContainerChanged={fetchContainers} />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Docker Containers</h2>
                            <p className="text-sm text-gray-600 mt-1">Monitor and manage docker containers running on the server</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xs text-sm font-medium-500 hover:border-primary transition-all active:scale-95" onClick={async () => {
                                await fetchContainers()
                            }}>
                                <LucideRotateCcwSquare/>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* <!-- Stats Overview (Grid) --> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                        {/* <!-- Card 1 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium">Running</p>
                                    <Ship />
                                </div>
                                <p className="text-black text-2xl font-bold">
                                    {summary.runningApps}
                                </p>
                            </div>
                        </div>

                        {/* <!-- Card 2 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium">Stopped</p>
                                    <CircleX />
                                </div>
                                <p className="text-black text-2xl font-bold">
                                    {summary.stoppedApps}
                                </p>
                            </div>
                        </div>

                        {/* <!-- Card 3 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium">Created</p>
                                    <PackagePlusIcon />
                                </div>
                                <p className="text-black text-2xl font-bold">
                                    {summary.createdApps}
                                </p>
                            </div>
                        </div>


                        {/* <!-- Card 4 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium">Exposed Ports</p>
                                    <EthernetPort />
                                </div>
                                <p className="text-black text-2xl font-bold">
                                    {summary.exposedPorts}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Section */}
                    <div className="bg-white border border-gray-300 rounded-xs p-4 mb-2 flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex items-center bg-gray-100 rounded-xs p-2 w-full lg:w-auto overflow-x-auto scrollbar-hide">
                            <button className={filterButtonClass("all")} onClick={() => setFilter("all")}>
                                All
                            </button>

                            <button className={filterButtonClass("running")} onClick={() => setFilter("running")}>
                                Running
                            </button>

                            <button className={filterButtonClass("exited")} onClick={() => setFilter("exited")}>
                                Exited
                            </button>

                            <button className={filterButtonClass("created")} onClick={() => setFilter("created")} >
                                Created
                            </button>
                        </div>
                        <div className="relative w-full lg:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mb-1">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-4 py-1.5 text-md focus:ring-sky-700 focus:border-gray-100 placeholder:text-sm" placeholder="Search containers..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    {/* Container Table */}
                    <div className="border border-gray-300 rounded-xs overflow-hidden mt-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200 border border-gray-200">
                                    <th className="px-6 py-4 text-xs text-gray-700 font-semibold">Status</th>
                                    <th className="px-6 py-4 text-xs text-gray-700 font-semibold">Container Name</th>
                                    <th className="px-6 py-4 text-xs text-gray-700 font-semibold">Image</th>
                                    <th className="px-6 py-4 text-xs text-gray-700 font-semibold">Ports</th>
                                    <th className="px-6 py-4 text-xs text-gray-700 font-semibold">Created</th>
                                    <th className="px-6 py-4 text-xs text-gray-700 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayedContainers.map((container) => (
                                    <tr
                                        onClick={() => handleViewContainer(container)}
                                        key={container.id}
                                        className="bg-white hover:bg-gray-50 hover:text-semibold transition-colors group">
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(container.state)}`}
                                            >
                                                {container.state.charAt(0).toUpperCase() + container.state.slice(1).toLowerCase()}
                                            </span>

                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                {/* Open Docker Details Drawer */}
                                                <button className="font-mono font-semibold text-xs text-sky-800 hover:underline text-left">{truncateText(container.name || container.name, 20)}</button>
                                                <span className="font-mono-md text-[11px] text-gray-500">{truncateText(container.id || container.Id, 12)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4  text-xs font-normal text-gray-600">{truncateText(container.image, 20)}</td>
                                        <td className="px-6 py-4 font-normal text-xs text-gray-600">{renderPorts(container.ports)}</td>
                                        <td className="px-6 py-4 font-normal text-xs text-gray-500">{formatDate(container.created)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {/* View Button */}
                                                <button
                                                    className="group/tooltip relative p-1.5 hover:bg-gray-200 rounded-sm text-gray-500 cursor-pointer"
                                                    onClick={() => handleViewContainer(container)}
                                                >
                                                    <span><Eye size={18} /></span>
                                                    {/* Tooltip */}
                                                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-sky-900 px-2 py-1 text-xs text-white transition-all group-hover/tooltip:scale-100 z-10 whitespace-nowrap">
                                                        View Container
                                                    </span>
                                                </button>

                                                {/* Play / Pause Button */}
                                                <button
                                                    onClick={(e) =>
                                                        openActionModal(
                                                            e,
                                                            container,
                                                            container.state === "running"
                                                                ? "stop"
                                                                : "start"
                                                        )
                                                    }
                                                    className={`
                                                        group/tooltip relative p-1.5 hover:bg-gray-200 rounded-sm cursor-pointer
                                                        ${container.state === "running"
                                                            ? "text-gray-500"
                                                            : "text-sky-700"}
                                                    `}
                                                >
                                                    {container.state === "running" ? (
                                                        <>
                                                            <Square size={18} />
                                                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-sky-900 px-2 py-1 text-xs text-white transition-all group-hover/tooltip:scale-100 z-10 whitespace-nowrap">
                                                                Stop Container
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play size={18} />
                                                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-sky-900 px-2 py-1 text-xs text-white transition-all group-hover/tooltip:scale-100 z-10 whitespace-nowrap">
                                                                Start Container
                                                            </span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Restart Button */}
                                                <button
                                                    onClick={(e) =>
                                                        openActionModal(
                                                            e,
                                                            container,
                                                            "restart"
                                                        )
                                                    }
                                                    className="group/tooltip relative p-1.5 hover:bg-gray-200 rounded-sm text-gray-500 cursor-pointer"
                                                >
                                                    <RotateCw size={18} />
                                                    {/* Tooltip */}
                                                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-sky-900 px-2 py-1 text-xs text-white transition-all group-hover/tooltip:scale-100 z-10 whitespace-nowrap">
                                                        Restart Container
                                                    </span>
                                                </button>
                                            </div>

                                        </td>
                                    </tr>
                                ))}


                            </tbody>
                        </table>
                        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
                            <span className="font-normal text-xs text-gray-500">
                                Showing {startIndex + 1} -{" "}
                                {Math.min(endIndex, filteredContainers.length)} of{" "}
                                {filteredContainers.length} containers
                            </span>

                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500">
                                    Page {currentPage} of {totalPages || 1}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={goPrevious}
                                        disabled={currentPage === 1}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-300 cursor-pointer"
                                    >
                                        <ChevronLeft className="text-gray-400" />
                                    </button>

                                    <button
                                        onClick={goNext}
                                        disabled={currentPage === totalPages}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-300 cursor-pointer"
                                    >
                                        <ChevronRight className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md bg-white rounded-md shadow-xl">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-lg">
                                Confirm Action
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-700">
                                Are you sure you want to{" "}
                                <span className="font-semibold">
                                    {selectedAction}
                                </span>{" "}
                                container{" "}
                                <span className="font-semibold">
                                    {selectedContainer?.name}
                                </span>
                                ?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">

                            <button
                                onClick={() =>
                                    setConfirmModalOpen(false)
                                }
                                disabled={actionLoading}
                                className="px-4 py-2 border border-gray-300 rounded-xs cursor-pointer hover:bg-gray-50 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleContainerAction}
                                disabled={actionLoading}
                                className={`
                                    px-4 py-2 rounded-xs text-white
                                    ${selectedAction === "stop"
                                        ? "bg-red-600 hover:bg-red-700 text-sm cursor-pointer"
                                        : selectedAction === "restart"
                                            ? "bg-amber-600 hover:bg-amber-700 text-sm rounded-xs cursor-pointer"
                                            : "bg-sky-700 hover:bg-sky-800 text-sm rounded-xs cursor-pointer"
                                    }
                                `}
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : `Confirm ${selectedAction}`}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DockerApps

