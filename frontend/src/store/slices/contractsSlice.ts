import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PBRContract } from '../../types';
import api from '../../services/api';

interface ContractsState {
  contracts: PBRContract[];
  loading: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  loading: false,
  error: null,
};

export const fetchContracts = createAsyncThunk(
  'contracts/fetchContracts',
  async () => {
    const response = await api.get('/contracts');
    return response.data.data;
  }
);

export const toggleContractLock = createAsyncThunk(
  'contracts/toggleLock',
  async (contractId: string) => {
    const response = await api.patch(`/contracts/${contractId}/toggle-lock`);
    return response.data.data;
  }
);

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    updateContractRealtime: (state, action: PayloadAction<PBRContract>) => {
      const index = state.contracts.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.contracts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contracts';
      })
      .addCase(toggleContractLock.fulfilled, (state, action) => {
        const index = state.contracts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
      });
  },
});

export const { updateContractRealtime } = contractsSlice.actions;
export default contractsSlice.reducer;