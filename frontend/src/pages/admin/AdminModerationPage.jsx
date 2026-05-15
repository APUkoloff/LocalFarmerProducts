import { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { adminApi } from '../../services/api';

export default function AdminModerationPage() {
  const [data, setData] = useState({ products: [], sellers: [] });

  const load = () => adminApi.moderation().then(({ data: d }) => setData(d));
  useEffect(() => { load(); }, []);

  const moderateProduct = async (id, status) => {
    await adminApi.moderateProduct(id, status);
    load();
  };

  const moderateSeller = async (id, status) => {
    await adminApi.moderateSeller(id, status);
    load();
  };

  return (
    <>
      <h4>Pending products</h4>
      <Table responsive className="bg-white shadow-sm mb-4">
        <thead><tr><th>Product</th><th>Seller</th><th></th></tr></thead>
        <tbody>
          {data.products?.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.seller_name}</td>
              <td>
                <Button size="sm" variant="success" className="me-1" onClick={() => moderateProduct(p.id, 'approved')}>Approve</Button>
                <Button size="sm" variant="danger" onClick={() => moderateProduct(p.id, 'rejected')}>Reject</Button>
              </td>
            </tr>
          ))}
          {!data.products?.length && <tr><td colSpan={3}>No pending products</td></tr>}
        </tbody>
      </Table>
      <h4>Pending sellers</h4>
      <Table responsive className="bg-white shadow-sm">
        <thead><tr><th>Farm</th><th>User</th><th></th></tr></thead>
        <tbody>
          {data.sellers?.map((s) => (
            <tr key={s.id}>
              <td>{s.farm_name}</td>
              <td>{s.user}</td>
              <td>
                <Button size="sm" variant="success" className="me-1" onClick={() => moderateSeller(s.id, 'approved')}>Approve</Button>
                <Button size="sm" variant="danger" onClick={() => moderateSeller(s.id, 'rejected')}>Reject</Button>
              </td>
            </tr>
          ))}
          {!data.sellers?.length && <tr><td colSpan={3}>No pending sellers</td></tr>}
        </tbody>
      </Table>
    </>
  );
}
