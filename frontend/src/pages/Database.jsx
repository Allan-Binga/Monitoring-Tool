import { CheckCircle2, DatabaseIcon, DatabaseZap, EllipsisVertical, Filter, RotateCw, XCircle } from "lucide-react"
import Sidebar from "../components/Sidebar"
import axios from "axios"
import { endpoint } from "../api"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Database() {
    const [engines, setEngines] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [summary, setSummary] = useState({
        totalEngines: 0,
        runningEngines: 0,
        stoppedEngines: 0,
        databaseTypes: 0
    })

    //Database API
    const fetchEngines = async ({
        isInitialLoad = false,
        isManualRefresh = false
    } = {}) => {
        try {
            if (isInitialLoad) {
                setLoading(true)
            }

            if (isManualRefresh) {
                setRefreshing(true)
            }

            const response = await axios.get(`${endpoint}/db/databases`)
            setEngines(response.data.databases)
            setSummary(response.data.summary)
        } catch (error) {
            console.error(error)
            setError("Failed to load apps.")
        } finally {
            if (isInitialLoad) {
                setLoading(false)
            }

            if (isManualRefresh) {
                setRefreshing(false)
            }
        }
    }

    //useEffect
    useEffect(() => {
        fetchEngines({ isInitialLoad: true })

        const interval = setInterval(() => {
            fetchEngines()
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    //Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        )
    }

    //Error Return
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                {error}
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                {/* Page Header */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-3xl font-semibold">Databases</h2>
                        <p className="text-sm text-gray-600 mt-1">Monitor your database servers</p>
                    </div>

                    {/* Server Refresh Button */}
                    <div className="flex items0center gap-3">
                        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-800 border border-gray-300 rounded-xs text-white text-sm font-medium-500 hover:bg-sky-900 hover:border-sky-500 transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={16} />
                            Refresh data
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-4">
                    {/* Card 1 */}
                    <div className="bg-white border border-gray-300 p-5 rounded-xs transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Detected</p>
                                <DatabaseIcon className="text-sky-800" />
                            </div>
                            <p className="text-black text-xl sm:text-2xl font-bold">{summary.totalEngines}</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-gray-300 p-5 rounded-xs transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Running</p>
                                <CheckCircle2 className="text-sky-800" />
                            </div>
                            <p className="text-black text-xl sm:text-2xl font-bold">{summary.runningEngines}</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white border border-gray-300 p-5 rounded-xs transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Stopped</p>
                                <XCircle className="text-sky-800" />
                            </div>
                            <p className="text-black text-xl sm:text-2xl font-bold">{summary.stoppedEngines}</p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white border border-gray-300 p-5 rounded-xs transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Engines</p>
                                <DatabaseZap className="text-sky-800" />
                            </div>
                            <p className="text-black text-xl sm:text-2xl font-bold">{summary.databaseTypes}</p>
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
                    {/* Header Section */}
                    <div className="px-4 md:px-6 py-4 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="font-semibold text-sm text-gray-800 font-semibold">Database Engines</h3>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button className="p-1 rounded hover:bg-gray-200 text-gray-600"><Filter className="w-4 h-4" /></button>
                            <button className="p-1 rounded hover:bg-gray-200 text-gray-600"><EllipsisVertical className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Table Wrapper */}
                    <div className="overflow-x-auto">
                        <table className="min-w-[850px] w-full text-center border-collapse text-xs text-gray-700">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="px-3 py-2 font-semibold uppercase tracking-wider text-left">Engine</th>
                                    <th className="px-3 py-2 font-semibold uppercase tracking-wider">Interface</th>
                                    <th className="px-3 py-2 font-semibold uppercase tracking-wider">Source</th>
                                    <th className="px-3 py-2 font-semibold uppercase tracking-wider">Version</th>
                                    <th className="px-3 py-2 font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-2 font-semibold uppercase tracking-wider">Endpoint</th>
                                </tr>
                            </thead>
                            {/* So this is what I want for myself and this is what I will go with no matter the obstacles and the almighty God is gonna stand with me, Amen! */}
                            <tbody>
                                {engines.map((db) => (
                                    <tr
                                        key={db.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-left font-medium">
                                            {db.engine}
                                        </td>

                                        <td className="px-4 py-3">
                                            {db.container || "System Service"}
                                        </td>

                                        <td className="px-4 py-3 capitalize">
                                            {db.source}
                                        </td>

                                        <td className="px-4 py-3">
                                            {db.image ?? "-"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${["running", "active"].includes(db.status)
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-red-50 text-red-700 border border-red-200"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full ${["running", "active"].includes(db.status)
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                        }`}
                                                />
                                                {db.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {db.source === "docker"
                                                ? db.container
                                                : "localhost"}
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Database