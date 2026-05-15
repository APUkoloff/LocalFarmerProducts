import { Link } from 'react-router-dom';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();

  if (!items.length) {
    return (
      <Container className="py-5">
        <Alert variant="info">{t('cart.empty')}</Alert>
        <Button as={Link} to="/catalog" variant="success">Go to catalog</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2>{t('cart.title')}</h2>
      <Table responsive className="mt-3 bg-white shadow-sm rounded">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{item.unitPrice} ₽</td>
              <td>
                <Form.Control
                  type="number" min="0.1" step="0.1" max={item.stockQty}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, parseFloat(e.target.value) || 0)}
                  style={{ width: 90 }}
                />
                {item.quantity > item.stockQty && (
                  <small className="text-danger d-block">Max: {item.stockQty}</small>
                )}
              </td>
              <td>{(item.unitPrice * item.quantity).toFixed(2)} ₽</td>
              <td><Button variant="outline-danger" size="sm" onClick={() => removeItem(item.productId)}>×</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h4>{t('cart.total')}: {total.toFixed(2)} ₽</h4>
      {user?.role === 'buyer' ? (
        <Button as={Link} to="/checkout" variant="success" className="mt-2">{t('cart.checkout')}</Button>
      ) : (
        <Alert variant="warning" className="mt-2">Login as buyer to checkout</Alert>
      )}
    </Container>
  );
}
