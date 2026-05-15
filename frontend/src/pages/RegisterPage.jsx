import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', role: 'buyer', farm_name: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register(form);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed');
    }
  };

  return (
    <Container style={{ maxWidth: 480 }} className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">{t('auth.register')}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>{t('auth.username')}</Form.Label>
              <Form.Control name="username" value={form.username} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>{t('auth.email')}</Form.Label>
              <Form.Control name="email" type="email" value={form.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={form.role} onChange={handleChange}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </Form.Select>
            </Form.Group>
            {form.role === 'seller' && (
              <Form.Group className="mb-2">
                <Form.Label>Farm name</Form.Label>
                <Form.Control name="farm_name" value={form.farm_name} onChange={handleChange} required />
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Label>{t('auth.password')}</Form.Label>
              <Form.Control name="password" type="password" value={form.password} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required />
            </Form.Group>
            <Button type="submit" variant="success" className="w-100">{t('auth.register')}</Button>
          </Form>
          <p className="mt-3 text-center"><Link to="/login">{t('nav.login')}</Link></p>
        </Card.Body>
      </Card>
    </Container>
  );
}
