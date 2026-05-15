import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { validatePhone, validateAddress } from '../utils/validation';
import ProtectedRoute from '../components/ProtectedRoute';

function CheckoutForm() {
  const { t } = useTranslation();
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    delivery_address: user?.default_address || '',
    phone: user?.phone || '',
    email: user?.email || '',
    payment_method: 'cash_on_delivery',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!validateAddress(form.delivery_address)) e.delivery_address = 'Address must be at least 10 characters';
    if (!validatePhone(form.phone)) e.phone = 'Invalid phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const { data } = await ordersApi.checkout({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        ...form,
      });
      clear();
      navigate(`/orders/${data.id}?success=1`);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <Container className="py-5"><Alert variant="info">Cart is empty</Alert></Container>;
  }

  return (
    <Container style={{ maxWidth: 560 }} className="py-4">
      <h2>{t('checkout.title')}</h2>
      <p>Total: <strong>{total.toFixed(2)} ₽</strong></p>
      {submitError && <Alert variant="danger">{submitError}</Alert>}
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('checkout.address')}</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                isInvalid={!!errors.delivery_address}
              />
              <Form.Control.Feedback type="invalid">{errors.delivery_address}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('checkout.phone')}</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.email')}</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('checkout.payment')}</Form.Label>
              <div>
                <Form.Check
                  type="radio" name="payment" id="card" label={t('checkout.card')}
                  checked={form.payment_method === 'card'}
                  onChange={() => setForm({ ...form, payment_method: 'card' })}
                />
                <Form.Check
                  type="radio" name="payment" id="cash" label={t('checkout.cash')}
                  checked={form.payment_method === 'cash_on_delivery'}
                  onChange={() => setForm({ ...form, payment_method: 'cash_on_delivery' })}
                />
              </div>
            </Form.Group>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? t('common.loading') : t('checkout.submit')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <CheckoutForm />
    </ProtectedRoute>
  );
}
