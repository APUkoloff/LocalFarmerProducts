import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/catalog');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <Container style={{ maxWidth: 420 }} className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">{t('auth.login')}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.username')}</Form.Label>
              <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.password')}</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <Button type="submit" variant="success" className="w-100">{t('auth.login')}</Button>
          </Form>
          <p className="mt-3 text-center">
            <Link to="/register">{t('nav.register')}</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
