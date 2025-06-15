import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Battery, Shield, AlertTriangle, Activity, Users, Lock, LogOut } from 'lucide-react';
import { fetchContracts, toggleContractLock } from '../store/slices/contractsSlice';
import { fetchShipments } from '../store/slices/shipmentsSlice';
import { logoutUser } from '../store/slices/authSlice';
import { DashboardStats } from '../types';
import ContractCard from './ContractCard';
import ShipmentTable from './ShipmentTable';
import ThresholdVisualization from './ThresholdVisualization';
import CreateShipmentModal from './CreateShipmentModal';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { contracts, loading: contractsLoading } = useSelector((state: RootState) => state.contracts);
  const { shipments, loading: shipmentsLoading } = useSelector((state: RootState) => state.shipments);
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    activeShipments: 0,
    blockedContracts: 0,
    alertsToday: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchContracts());
    dispatch(fetchShipments());
  }, [dispatch]);

  useEffect(() => {
    setStats({
      totalContracts: contracts.length,
      activeShipments: shipments.filter(s => s.status === 'PENDING').length,
      blockedContracts: contracts.filter(c => c.isLocked).length,
      alertsToday: contracts.reduce((acc, c) => acc + c.notificationsSent.length, 0),
    });
  }, [contracts, shipments]);

  const handleToggleLock = (contractId: string) => {
    if (user?.role === 'admin') {
      dispatch(toggleContractLock(contractId));
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (contractsLoading || shipmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Battery className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PBR Battery Monitoring</h1>
                <p className="text-sm text-gray-500">Real-time Shipment Control System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                New Shipment
              </button>
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContracts}</p>
              </div>
              <Shield className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeShipments}</p>
              </div>
              <Activity className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Contracts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.blockedContracts}</p>
              </div>
              <Lock className="h-12 w-12 text-red-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.alertsToday}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Contract Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contract Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <ContractCard
                key={contract._id}
                contract={contract}
                onToggleLock={handleToggleLock}
                canToggleLock={user?.role === 'admin'}
              />
            ))}
          </div>
        </div>

        {/* Threshold Visualization */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Threshold Analysis</h2>
          <div className="card">
            <ThresholdVisualization contracts={contracts} />
          </div>
        </div>

        {/* Recent Shipments */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Shipments</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ShipmentTable shipments={shipments.slice(0, 10)} />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateShipmentModal
          contracts={contracts}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;