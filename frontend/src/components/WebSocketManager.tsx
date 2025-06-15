import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { updateContractRealtime } from '../store/slices/contractsSlice';
import { addShipmentRealtime, updateShipmentRealtime } from '../store/slices/shipmentsSlice';

let socket: Socket;

const WebSocketManager: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socket = io('http://localhost:5000', {
      auth: { token },
    });

    socket.on('contractUpdated', (contract) => {
      dispatch(updateContractRealtime(contract));
    });

    socket.on('shipmentCreated', (shipment) => {
      dispatch(addShipmentRealtime(shipment));
    });

    socket.on('shipmentUpdated', (shipment) => {
      dispatch(updateShipmentRealtime(shipment));
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [dispatch]);

  return null;
};

export default WebSocketManager;