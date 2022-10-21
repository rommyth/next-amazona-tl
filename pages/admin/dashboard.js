import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import AdminMenu from '../../components/AdminMenu';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const initialState = {
  loading: true,
  summary: { salesData: [] },
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload };
    case 'FETCH_FAIL ':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function AdminDashboardScreen() {
  const [{ loading, error, summary }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/admin/summary');
        console.log(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    };
    fetchData();
  }, []);

  const data = {
    labels: summary.salesData.map((x) => x._id),
    datasets: [
      {
        label: 'Sales',
        backgroundColor: 'rgba(162, 222, 208, 1)',
        data: summary.salesData.map((x) => x.totalSales),
      },
    ],
  };
  return (
    <Layout title={'Admin Dashboard'}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <AdminMenu active="dashboard" />
        <div className="md:col-span-3">
          <h1 className="mb-4 text-xl">Admin Dashboard</h1>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="card m-5 p-5">
                  <p className="text-3xl">${summary.ordersPrice}</p>
                  <p>Sales</p>
                  <Link href="/admin/orders">View Sales</Link>
                </div>
                <div className="card m-5 p-5">
                  <p className="text-3xl">{summary.orderCount}</p>
                  <p>Orders</p>
                  <Link href="/admin/orders">View Orders</Link>
                </div>
                <div className="card m-5 p-5">
                  <p className="text-3xl">{summary.productCount}</p>
                  <p>Products</p>
                  <Link href="/admin/orders">View Products</Link>
                </div>
                <div className="card m-5 p-5">
                  <p className="text-3xl">{summary.userCount}</p>
                  <p>Users</p>
                  <Link href="/admin/orders">View Users</Link>
                </div>
              </div>
              {/* <h2 className="text-xl">Sales Report</h2>
              <Bar
                options={{ legend: { display: true, position: 'right' } }}
                data={data}
              /> */}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminDashboardScreen.auth = { adminOnly: true };
