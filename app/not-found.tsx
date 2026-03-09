import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-mono">
      <h2 className="text-4xl font-bold text-blue-500 mb-4 tracking-widest uppercase animate-pulse">404 - System Error</h2>
      <p className="text-blue-200/60 mb-8 text-center max-w-md">
        Sir, the requested coordinate does not exist in the current database. The neural link has been severed.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all uppercase tracking-tighter font-bold"
      >
        Return to Command Center
      </Link>
    </div>
  );
}
