import { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../../services/api';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    adminApi.analytics({ period }).then(({ data: d }) => setData(d));
  }, [period]);

  const download = async (format) => {
    const fn = format === 'csv' ? adminApi.exportCsv : adminApi.exportXlsx;
    const { data: blob } = await fn({ period });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <Form.Select style={{ width: 200 }} value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </Form.Select>
        <Button variant="outline-success" onClick={() => download('csv')}>Export CSV</Button>
        <Button variant="outline-success" onClick={() => download('xlsx')}>Export XLSX</Button>
      </div>
      <Row className="g-3 mb-4">
        <Col md={4}><Card className="shadow-sm"><Card.Body><Card.Title>Users</Card.Title><h3>{data.total_users}</h3></Card.Body></Card></Col>
        <Col md={4}><Card className="shadow-sm"><Card.Body><Card.Title>Orders</Card.Title><h3>{data.total_orders}</h3></Card.Body></Card></Col>
        <Col md={4}><Card className="shadow-sm"><Card.Body><Card.Title>Revenue</Card.Title><h3>{data.total_revenue?.toFixed(2)} ₽</h3></Card.Body></Card></Col>
      </Row>
      <Card className="shadow-sm p-3">
        <h5>Revenue by period</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenue_by_period || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#2d6a4f" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
