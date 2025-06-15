import React from 'react';
import { PBRContract } from '../types';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface ThresholdVisualizationProps {
  contracts: PBRContract[];
}

const ThresholdVisualization: React.FC<ThresholdVisualizationProps> = ({ contracts }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Shipment Progress by Contract</h3>
      </div>
      
      <div className="space-y-4">
        {contracts.map((contract) => {
          const percentage = (contract.batteriesShipped / contract.threshold) * 100;
          const isWarning = percentage >= 80;
          const isExceeded = percentage >= 100;
          
          return (
            <div key={contract._id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{contract.contractId}</span>
                  {isWarning && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {contract.batteriesShipped}/{contract.threshold}
                  </div>
                  <div className={`text-xs ${isExceeded ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                {/* 80% Warning Line */}
                <div
                  className="absolute top-0 h-3 w-0.5 bg-yellow-400 rounded-full"
                  style={{ left: '80%' }}
                />
                
                {/* Progress Text */}
                <div className="mt-1 text-xs text-gray-500">
                  <span className="inline-flex items-center space-x-1">
                    <span>Shipped: {contract.batteriesShipped}</span>
                    <span>•</span>
                    <span>Threshold: {contract.threshold}</span>
                    <span>•</span>
                    <span className={isWarning ? 'text-yellow-600 font-medium' : ''}>
                      {percentage >= 80 ? 'Warning Zone' : `${(80 - percentage).toFixed(1)}% to warning`}
                    </span>
                  </span>
                </div>
              </div>
              
              {contract.isLocked && (
                <div className="text-xs text-red-600 font-medium">
                  🔒 Contract locked - further shipments blocked
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <div className="h-2 w-8 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: '80%' }} />
            </div>
          </div>
          <div className="text-sm text-blue-800">
            <strong>Legend:</strong> Progress bars turn yellow at 80% threshold and red when exceeded. 
            Automatic blocking occurs when limits are reached.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdVisualization;