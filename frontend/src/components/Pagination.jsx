import { Pagination as BSPagination } from 'react-bootstrap';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const items = [];
  for (let i = 1; i <= totalPages; i++) {
    items.push(
      <BSPagination.Item key={i} active={i === page} onClick={() => onPageChange(i)}>
        {i}
      </BSPagination.Item>
    );
  }
  return (
    <BSPagination className="justify-content-center mt-3">
      <BSPagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
      {items}
      <BSPagination.Next disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
    </BSPagination>
  );
}
