import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function ProfileForm() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    default_address: user?.default_address || '',
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    setMsg('Profile saved');
  };

  return (
    <Container style={{ maxWidth: 520 }} className="py-4">
      <h2>{t('nav.profile')}</h2>
      {msg && <Alert variant="success">{msg}</Alert>}
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {['first_name', 'last_name', 'email', 'phone'].map((field) => (
              <Form.Group key={field} className="mb-2">
                <Form.Label>{field}</Form.Label>
                <Form.Control
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Default address</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                value={form.default_address}
                onChange={(e) => setForm({ ...form, default_address: e.target.value })}
              />
            </Form.Group>
            <Button type="submit" variant="success">{t('common.save')}</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <ProfileForm />
    </ProtectedRoute>
  );
}
