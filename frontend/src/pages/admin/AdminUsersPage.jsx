import { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { adminApi } from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});

  const load = () => adminApi.users().then(({ data }) => setUsers(data.results || data));
  useEffect(() => { load(); }, []);

  const toggleBlock = async (user) => {
    await adminApi.blockUser(user.id, !user.is_blocked);
    load();
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone });
  };

  const saveEdit = async () => {
    await adminApi.updateUser(editUser.id, form);
    setEditUser(null);
    load();
  };

  return (
    <>
      <Table responsive className="bg-white shadow-sm">
        <thead><tr><th>User</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username} ({u.email})</td>
              <td><Badge bg="secondary">{u.role}</Badge></td>
              <td>{u.is_blocked ? <Badge bg="danger">Blocked</Badge> : <Badge bg="success">Active</Badge>}</td>
              <td>
                <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(u)}>Edit</Button>
                <Button size="sm" variant={u.is_blocked ? 'success' : 'danger'} onClick={() => toggleBlock(u)}>
                  {u.is_blocked ? 'Unblock' : 'Block'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={!!editUser} onHide={() => setEditUser(null)}>
        <Modal.Header closeButton><Modal.Title>Edit user</Modal.Title></Modal.Header>
        <Modal.Body>
          {Object.keys(form).map((k) => (
            <Form.Group key={k} className="mb-2">
              <Form.Label>{k}</Form.Label>
              <Form.Control value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={saveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
