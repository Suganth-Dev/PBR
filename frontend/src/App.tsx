
import { Provider } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import WebSocketManager from './components/WebSocketManager';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <WebSocketManager />
      </div>
    </Provider>
  );
}

export default App;
