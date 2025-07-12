import { BarChart3 } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Balancer</h1>
            <p className="text-gray-600 mt-1">
              Optimize your investment allocations with precision and confidence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
