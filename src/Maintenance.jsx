import { motion } from 'framer-motion';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
            Scheduled maintenance
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">We’ll be back soon</h1>
          <p className="mt-3 text-sm text-gray-400">
            We’re working on Scribly v0.7.0 stable release. During this time, some features may be unavailable.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 text-left">
              <div className="text-gray-400 text-xs">Current version</div>
              <div className="mt-1 font-semibold">0.7.0 (stable)</div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 text-left">
              <div className="text-gray-400 text-xs">Status</div>
              <div className="mt-1 font-semibold text-yellow-300">Under maintenance</div>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Thanks for your patience. Follow updates in the release notes once we’re live.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
