import React from 'react';
import { AlertTriangle } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Under Maintenance</h1>
        <p className="text-gray-600 mb-6">
          We are currently updating our system to provide you with a better experience. 
          Please check back shortly.
        </p>
        <div className="text-sm text-gray-500">
          Expected uptime: <span className="font-semibold text-gray-700">Soon</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
