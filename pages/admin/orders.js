import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer } from 'react';
import AdminMenuComponent from '../../components/AdminMenu';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';

const initialValues = {
  loading: false,
  orders: [],
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL ':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function AdminOrdersScreen() {
  const [{ loading, orders, error }, dispatch] = useReducer(
    reducer,
    initialValues
  );

  console.log(orders);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/admin/orders');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, []);
  return (
    <Layout title="Admin Dashboard">
      <div className="grid md:grid-cols-4 md:gap-5">
        <AdminMenuComponent active="orders" />
        <div className="md:col-span-3 overflow-x-auto">
          <h1 className="mb-4 text-xl">Admin Orders</h1>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="p-5 text-left">ID</th>
                    <th className="p-5 text-left">USER</th>
                    <th className="p-5 text-left">DATE</th>
                    <th className="p-5 text-left">TOTAL</th>
                    <th className="p-5 text-left">PAID</th>
                    <th className="p-5 text-left">DELIVERED</th>
                    <th className="p-5 text-left">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="p-5">{order._id.substring(20, 24)}</td>
                      <td className="p-5">
                        {order.user ? order.user.name : 'DELETED USER'}
                      </td>
                      <td className="p-5">
                        {order.createdAt.substring(0, 10)}
                      </td>
                      <td className="p-5">${order.totalPrice}</td>
                      <td className="p-5">
                        {order.isPaid
                          ? `${order.paidAt.substring(0, 10)}`
                          : 'not paid'}
                      </td>
                      <td className="p-5">
                        {order.isDelivered
                          ? `${order.deliveredAt?.substring(0, 10)}`
                          : 'not delivered'}
                      </td>
                      <td className="px-5">
                        <Link href={`/order/${order._id}`} passHref>
                          <a className="bg-black px-2 py-1 text-xs text-white">
                            Details
                          </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );

  AdminOrdersScreen.auth = { adminOnly: true };
}
