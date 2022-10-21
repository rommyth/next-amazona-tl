import Link from 'next/link';
import React from 'react';

export default function AdminMenuComponent({ active }) {
  return (
    <>
      <div className="">
        <ul>
          <li>
            <Link href="/admin/dashboard">
              <a className={active == 'dashboard' ? 'font-bold' : ''}>
                Dashboard
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/orders">
              <a className={active == 'orders' ? 'font-bold' : ''}>Orders</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/products">
              <a className={active == 'products' ? 'font-bold' : ''}>
                Products
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/users">
              <a className={active == 'users' ? 'font-bold' : ''}>Users</a>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
