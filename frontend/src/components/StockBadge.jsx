import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function StockBadge({ stockQty, unit }) {
  const { t } = useTranslation();
  const qty = parseFloat(stockQty);

  if (qty <= 0) {
    return <Badge bg="danger" className="ms-1">{t('catalog.outOfStock')}</Badge>;
  }
  if (qty < 10) {
    return <span className="stock-low ms-1">{t('catalog.lowStock')}: {qty} {unit}</span>;
  }
  return <span className="text-muted ms-1 small">{qty} {unit}</span>;
}
