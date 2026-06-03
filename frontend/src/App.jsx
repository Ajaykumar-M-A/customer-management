import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import Login from './pages/Login.jsx';
import Tasks from './pages/Tasks.jsx';
import Users from './pages/Users.jsx';

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route
            path="/users"
            element={
              <RoleRoute roles={['admin']}>
                <Users />
              </RoleRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <RoleRoute roles={['admin', 'manager']}>
                <ActivityLogs />
              </RoleRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
