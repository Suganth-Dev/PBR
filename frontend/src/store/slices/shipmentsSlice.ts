import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShipmentLog } from '../../types';
import api from '../../services/api';

interface ShipmentsState {
  shipments: ShipmentLog[];
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [],
  loading: false,
  error: null,
};

export const fetchShipments = createAsyncThunk(
  'shipments/fetchShipments',
  async () => {
    const response = await api.get('/shipments');
    return response.data.data;
  }
);

export const createShipment = createAsyncThunk(
  'shipments/createShipment',
  async (shipmentData: { contractId: string; batteriesShipped: number }) => {
    const response = await api.post('/shipments', shipmentData);
    return response.data.data;
  }
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    addShipmentRealtime: (state, action: PayloadAction<ShipmentLog>) => {
      state.shipments.unshift(action.payload);
    },
    updateShipmentRealtime: (state, action: PayloadAction<ShipmentLog>) => {
      const index = state.shipments.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.shipments[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.shipments = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.shipments.unshift(action.payload);
      });
  },
});

export const { addShipmentRealtime, updateShipmentRealtime } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;