import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../api.js';

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const onSubmit = async (data) => {
    setError('');
    try {
      const { token } = await api(`/auth/${mode}`, { method: 'POST', body: data });
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="auth">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-card">
        <h1>{isLogin ? 'Log in to CodeFolio' : 'Create your CodeFolio'}</h1>
        {!isLogin && (
          <label>Username
            <input placeholder="john" autoComplete="username" {...register('username', { required: true })} />
            <small>Your portfolio will live at /john</small>
          </label>
        )}
        <label>Email
          <input type="email" autoComplete="email" {...register('email', { required: true })} />
        </label>
        <label>Password
          <input type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} {...register('password', { required: true })} />
          {!isLogin && <small>At least 8 characters</small>}
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={isSubmitting}>{isLogin ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}>
          {isLogin ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  );
}
