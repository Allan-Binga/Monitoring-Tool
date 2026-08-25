import Sidebar from "../components/Sidebar"

function Logs() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                {/* Page Header */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-3xl font-semibold">Logs</h2>
                        <p className="text-sm text-gray-600 mt-1">See different Logs for your hosted servers</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Logs