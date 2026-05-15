import { Routes, Route, NavLink } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminUsersPage from './AdminUsersPage';
import AdminModerationPage from './AdminModerationPage';
import AdminAnalyticsPage from './AdminAnalyticsPage';

export default function AdminPanel() {
  return (
    <ProtectedRoute roles={['admin']}>
      <Container className="py-4">
        <h2>Admin Panel</h2>
        <Nav variant="pills" className="mb-3">
          <Nav.Item><Nav.Link as={NavLink} to="/admin/users" end>Users</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link as={NavLink} to="/admin/moderation">Moderation</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link as={NavLink} to="/admin/analytics">Analytics</Nav.Link></Nav.Item>
        </Nav>
        <Routes>
          <Route index element={<AdminUsersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
        </Routes>
      </Container>
    </ProtectedRoute>
  );
}
