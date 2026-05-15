import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Table, Badge, Nav, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ordersApi } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';

const STATUS_COLORS = {
  pending: 'warning', processing: 'info', shipping: 'primary',
  delivered: 'success', cancelled: 'secondary',
};

function OrderHistory() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('status') || 'active';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi.list({ status: tab }).then(({ data }) => {
      setOrders(data.results || data);
    }).finally(() => setLoading(false));
  }, [tab]);

  return (
    <Container className="py-4">
      <h2>{t('nav.orders')}</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item>
          <Nav.Link active={tab === 'active'} onClick={() => setSearchParams({ status: 'active' })}>Active</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={tab === 'archived'} onClick={() => setSearchParams({ status: 'archived' })}>Archive</Nav.Link>
        </Nav.Item>
      </Nav>
      {loading ? <Spinner /> : (
        <Table responsive className="bg-white shadow-sm">
          <thead><tr><th>#</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td><Badge bg={STATUS_COLORS[o.status]}>{o.status_display || o.status}</Badge></td>
                <td>{o.total} ₽</td>
                <td><Link to={`/orders/${o.id}`}>Details</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <OrderHistory />
    </ProtectedRoute>
  );
}
