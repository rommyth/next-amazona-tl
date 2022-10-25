/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

import Link from 'next/link';
import Image from 'next/image';

import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { toast } from 'react-toastify';

import { getError } from '../../utils/error';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';

const initialValues = {
  loading: true,
  reviews: [],
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'REVIEW_REQUEST':
      return { ...state, loading: true };
    case 'REVIEW_SUCCESS':
      return { ...state, loading: false, reviw: action.payload, error: '' };
    case 'REVIEW_FAIL':
      return { ...state, loading: false, error: '' };

    case 'POST_REVIEW_REQUEST':
      return { ...state, loadingPost: true };
    case 'POST_REVIEW_SUCCESS':
      return { ...state, loadingPost: false, errorPost: '' };
    case 'POST_REVIEW_FAIL':
      return { ...state, loadingPost: false, errorPost: action.payload };
  }
}

export default function ProductScreen({ product }) {
  const { state, dispatch } = useContext(Store);
  const { data: session } = useSession();
  const [{ loading, reviews, error }, reviewDispatch] = useReducer(
    reducer,
    initialValues
  );
  const router = useRouter();
  console.log(product);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  if (!product) {
    return <Layout title="Product Not Found">Prduct Not Found</Layout>;
  }

  const onAddToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error('Sorry, Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  const submitRatingHandler = async ({ rating, comment }) => {
    try {
      dispatch({ type: 'POST_REVIEW_REQUEST' });
      await axios.post(`/api/products/${product._id}/reviews`, {
        rating,
        comment,
      });
      dispatch({ type: 'POST_REVIEW_SUCCESS' });
      toast.success('Product review successfully');
      fetchData();
    } catch (err) {
      dispatch({ type: 'POST_REVIEW_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const fetchData = async () => {
    try {
      reviewDispatch({ type: 'REVIEW_REQUEST' });
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      reviewDispatch({ type: 'REVIEW_SUCCESS', payload: data });
    } catch (err) {
      reviewDispatch({ type: 'REVIEW_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    fetchData();
  }, [product]);
  return (
    <>
      <Layout title={product.name}>
        <div className="py-2">
          <Link href="/">back to products</Link>
        </div>
        <div className="grid md:grid-cols-4 md:gap-3">
          <div className="md:col-span-2">
            <Image
              src={product.image}
              alt={product.name}
              width={640}
              height={640}
              layout="responsive"
              objectFit="cover"
            />
          </div>
          <div>
            <ul>
              <li>
                <h1 className="text-lg">{product.name}</h1>
              </li>
              <li>Category: {product.category}</li>
              <li>Brand: {product.brand}</li>
              <li>
                {product.rating} of {product.numReviews} reviews
              </li>
              <li>Description: {product.description}</li>
            </ul>
          </div>
          <div>
            <div className="card p-5">
              <div className="mb-2 flex justify-between">
                <div>Price</div>
                <div>${product.price}</div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>Status</div>
                <div>
                  {product.countInStock > 0 ? 'In stock' : 'Unavailable'}
                </div>
              </div>
              <button
                className="primary-button w-full"
                onClick={onAddToCartHandler}
              >
                Add to cart{' '}
              </button>
            </div>
          </div>
        </div>
        <div className="my-4 ">
          <h1 className="mb-4 text-lg font-bold">Reviews</h1>
          <div className="flex items-center gap-4 mb-4">
            {[...Array(5)].map((v, i) => {
              const rating = i + 1;
              return (
                <div key={i}>
                  <label htmlFor="rating" className="my-0">
                    {rating} &nbsp;
                  </label>
                  <input
                    type="radio"
                    id="rating"
                    {...register('rating', {
                      required: 'Rating is required',
                      min: { value: 1, message: 'min rating 1' },
                    })}
                    value={rating}
                  />
                  {errors.rating && <div>{errors.rating.message}</div>}
                </div>
              );
            })}
          </div>
          <div className="mb-4 ">
            <label htmlFor="comment" className="block">
              Comment
            </label>
            <textarea
              id="comment"
              rows={3}
              className="w-full md:w-2/4 block mb-4"
              placeholder="Comment here"
              {...register('comment', {
                maxLength: { value: 200, message: 'Max 200 chars' },
              })}
            />
            <button
              type="button"
              className="primary-button w-full md:w-2/4"
              onClick={handleSubmit(submitRatingHandler)}
              disabled={session ? false : true}
            >
              {session ? 'Send' : 'Login required'}
            </button>
          </div>
          <ul>
            {reviews.length === 0 && <div>No Reviews</div>}
            {reviews.map((review, i) => (
              <li key={i}>
                <div className="grid md:grid-cols-5 md:gap-5 mb-4">
                  <div className="md:border-r">
                    <h3>{review.name}</h3>
                    <span>{review.createdAt?.substring(10, 24)}</span>
                  </div>
                  <div className="md:col-span-4">
                    <h3>{review.rating}</h3>
                    <span>{review.comment}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }, '-reviews').lean();
  await db.disconnect();
  return {
    props: {
      product: product ? db.convertDocToObj(product) : null,
    },
  };
}
