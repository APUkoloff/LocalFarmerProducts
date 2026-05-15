import { useEffect, useState } from 'react';
import { Table, Badge, Form, Nav } from 'react-bootstrap';
import { ordersApi } from '../../services/api';

const STATUSES = ['pending', 'processing', 'shipping', 'delivered', 'cancelled'];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('active');

  const load = () => ordersApi.sellerList({ status: tab }).then(({ data }) => setOrders(data.results || data));
  useEffect(() => { load(); }, [tab]);

  const updateStatus = async (id, status) => {
    await ordersApi.updateStatus(id, status);
    load();
  };

  return (
    <>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link active={tab === 'active'} onClick={() => setTab('active')}>Active</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link active={tab === 'archived'} onClick={() => setTab('archived')}>Archive</Nav.Link></Nav.Item>
      </Nav>
      <Table responsive className="bg-white shadow-sm">
        <thead><tr><th>#</th><th>Buyer</th><th>Total</th><th>Status</th><th>Change</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.email}</td>
              <td>{o.total} ₽</td>
              <td><Badge bg="info">{o.status_display || o.status}</Badge></td>
              <td>
                <Form.Select size="sm" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
