import React from 'react';
import { PBRContract } from '../types';
import { Lock, Unlock, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContractCardProps {
  contract: PBRContract;
  onToggleLock: (contractId: string) => void;
  canToggleLock: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onToggleLock, canToggleLock }) => {
  const percentage = (contract.batteriesShipped / contract.threshold) * 100;
  const isWarning = percentage >= 80;
  const isBlocked = contract.isLocked || contract.batteriesShipped >= contract.threshold;

  const getStatusColor = () => {
    if (isBlocked) return 'text-red-600 bg-red-50';
    if (isWarning) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = () => {
    if (isBlocked) return 'BLOCKED';
    if (isWarning) return 'WARNING';
    return 'ACTIVE';
  };

  const getStatusIcon = () => {
    if (isBlocked) return <Lock className="h-4 w-4" />;
    if (isWarning) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{contract.contractId}</h3>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Device Count:</span>
          <span className="font-medium text-gray-900">{contract.deviceCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Batteries Shipped:</span>
          <span className="font-medium text-gray-900">{contract.batteriesShipped}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Threshold:</span>
          <span className="font-medium text-gray-900">{contract.threshold}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Usage</span>
          <span className={`font-medium ${percentage >= 80 ? 'text-red-600' : 'text-gray-900'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Notifications */}
      {contract.notificationsSent.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Recent Alerts</span>
          </div>
          <div className="space-y-1">
            {contract.notificationsSent.slice(-2).map((notification, index) => (
              <div key={index} className="text-xs text-gray-600">
                <span className="font-medium">{notification.email}</span> - {notification.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Updated {formatDistanceToNow(new Date(contract.lastUpdated))} ago
        </div>
        {canToggleLock && (
          <button
            onClick={() => onToggleLock(contract._id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
              contract.isLocked
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {contract.isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span>{contract.isLocked ? 'Unlock' : 'Lock'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractCard;