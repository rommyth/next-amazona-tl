import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { getError } from '../utils/error';

const initialValues = {
  loading: false,
  user: {},
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'REGISTER_REQUEST':
      return { ...state, loading: true };
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'REGISTER_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function RegisterScreen() {
  const { data: session } = useSession();

  const router = useRouter();
  const [{ loading, user, error }, dispatch] = useReducer(
    reducer,
    initialValues
  );
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({ name, email, password }) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });
      dispatch({ type: 'REGISTER_SUCCESS' });
      login(email, password);
    } catch (err) {
      dispatch({ type: 'REGISTER_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(error));
    }
  };

  // console.log(user);

  console.log(session);
  useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);
  return (
    <Layout title="Register">
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="mx-auto max-w-screen-md"
      >
        <h1 className="mb-4 text-xl">Register</h1>
        <div className="mb-4">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="w-full"
            id="name"
            autoFocus
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && (
            <div className="text-red-500">{errors.name.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="w-full"
            id="email"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="w-full"
            id="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 5, message: 'Password more than 5 chars' },
            })}
          />
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            className="w-full"
            id="confirmPassword"
            {...register('confirmPassword', {
              validate: (value) => value === getValues('password'),
            })}
          />
          {errors.confirmPassword?.type === 'validate' && (
            <div className="text-red-500">Password do not match</div>
          )}
        </div>
        <div className="mb-4">
          <button type="submit" className="primary-button w-full">
            {loading ? 'Loading...' : 'Register'}
          </button>
        </div>
        <div className="mb-4">
          <p>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </form>
    </Layout>
  );
}
