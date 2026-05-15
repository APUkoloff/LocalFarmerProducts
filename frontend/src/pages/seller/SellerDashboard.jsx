import { Routes, Route, NavLink } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';
import ProtectedRoute from '../../components/ProtectedRoute';
import SellerProductsPage from './SellerProductsPage';
import SellerOrdersPage from './SellerOrdersPage';
import SellerStatsPage from './SellerStatsPage';

export default function SellerDashboard() {
  return (
    <ProtectedRoute roles={['seller']}>
      <Container className="py-4">
        <h2>Seller Dashboard</h2>
        <Nav variant="pills" className="mb-3">
          <Nav.Item><Nav.Link as={NavLink} to="/seller/products" end>Products</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link as={NavLink} to="/seller/orders">Orders</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link as={NavLink} to="/seller/stats">Statistics</Nav.Link></Nav.Item>
        </Nav>
        <Routes>
          <Route index element={<SellerProductsPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="stats" element={<SellerStatsPage />} />
        </Routes>
      </Container>
    </ProtectedRoute>
  );
}
