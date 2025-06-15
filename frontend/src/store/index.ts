import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import contractsSlice from './slices/contractsSlice';
import shipmentsSlice from './slices/shipmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    contracts: contractsSlice,
    shipments: shipmentsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;