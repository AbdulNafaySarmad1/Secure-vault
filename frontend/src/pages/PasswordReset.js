import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PasswordReset = () => {
  const [step, setStep] = useState('request'); // request, reset, success
  const [email, setEmail] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onRequestSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/password-reset', { email: data.email });
      setEmail(data.email);
      toast.success('If email exists, reset instructions sent');
      setStep('reset');
    } catch (error) {
      toast.error('Failed to send reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword
      });
      toast.success('Password reset successful! Please login.');
      setStep('success');
    } catch (error) {
      toast.error('Invalid or expired token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {step === 'request' && 'Reset your password'}
            {step === 'reset' && 'Enter new password'}
            {step === 'success' && 'Password reset!'}
          </h2>
        </div>

        {step === 'request' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onRequestSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onResetSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reset Token</label>
              <input
                {...register('token', { required: 'Token is required' })}
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Paste the token from your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                {...register('newPassword', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                type="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="mt-8 text-center">
            <p className="text-green-600 mb-4">Your password has been reset successfully.</p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
