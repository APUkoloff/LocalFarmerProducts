import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { productsApi } from '../../services/api';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', unit: 'piece', stock_qty: '',
  });
  const [error, setError] = useState('');

  const load = () => productsApi.sellerList().then(({ data }) => setProducts(data.results || data));
  useEffect(() => {
    load();
    productsApi.categories().then(({ data }) => setCategories(data));
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category: categories[0]?.id || '', unit: 'piece', stock_qty: '' });
    setShow(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '', price: p.price,
      category: p.category, unit: p.unit, stock_qty: p.stock_qty,
    });
    setShow(true);
  };

  const handleSave = async () => {
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock_qty: parseFloat(form.stock_qty),
      category: parseInt(form.category, 10),
    };
    try {
      if (editing) await productsApi.sellerUpdate(editing.id, payload);
      else await productsApi.sellerCreate(payload);
      setShow(false);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete product?')) {
      await productsApi.sellerDelete(id);
      load();
    }
  };

  return (
    <>
      <Button variant="success" className="mb-3" onClick={openNew}>Add product</Button>
      <Table responsive className="bg-white shadow-sm">
        <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price} ₽</td>
              <td>{p.stock_qty} {p.unit}</td>
              <td>{p.moderation_status || 'approved'}</td>
              <td>
                <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(p)}>Edit</Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit' : 'New'} product</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {['name', 'description', 'price', 'stock_qty'].map((f) => (
            <Form.Group key={f} className="mb-2">
              <Form.Label>{f}</Form.Label>
              <Form.Control
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              />
            </Form.Group>
          ))}
          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>
            <Form.Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ru}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Unit</Form.Label>
            <Form.Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="piece">Piece</option>
              <option value="kg">Kg</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
