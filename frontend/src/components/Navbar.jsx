import { Link, NavLink } from 'react-router-dom';
import { Badge, Container, Nav, Navbar as BSNavbar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { count } = useCart();

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('fresh_market_lang', lng);
  };

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm mb-3">
      <Container>
        <BSNavbar.Brand as={Link} to="/">Fresh Market</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="nav" />
        <BSNavbar.Collapse id="nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>{t('nav.home')}</Nav.Link>
            <Nav.Link as={NavLink} to="/catalog">{t('nav.catalog')}</Nav.Link>
            <Nav.Link as={NavLink} to="/cart">
              {t('nav.cart')} {count > 0 && <Badge bg="success">{count}</Badge>}
            </Nav.Link>
            {user?.role === 'buyer' && (
              <>
                <Nav.Link as={NavLink} to="/profile">{t('nav.profile')}</Nav.Link>
                <Nav.Link as={NavLink} to="/orders">{t('nav.orders')}</Nav.Link>
              </>
            )}
            {user?.role === 'seller' && (
              <Nav.Link as={NavLink} to="/seller">{t('nav.seller')}</Nav.Link>
            )}
            {(user?.role === 'admin' || user?.is_superuser) && (
              <Nav.Link as={NavLink} to="/admin">{t('nav.admin')}</Nav.Link>
            )}
          </Nav>
          <Nav>
            <Nav.Link onClick={() => switchLang('ru')} className="px-1">RU</Nav.Link>
            <Nav.Link onClick={() => switchLang('en')} className="px-1">EN</Nav.Link>
            {!user ? (
              <>
                <Nav.Link as={NavLink} to="/login">{t('nav.login')}</Nav.Link>
                <Nav.Link as={NavLink} to="/register">{t('nav.register')}</Nav.Link>
              </>
            ) : (
              <Nav.Link onClick={logout}>{t('nav.logout')} ({user.username})</Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
