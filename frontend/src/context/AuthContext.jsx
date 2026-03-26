import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, token: null, loading: false, error: null };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // Track interceptor ID so we can eject and re-register without stacking
  const interceptorRef = useRef(null);

  const setupAxios = useCallback((token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }

    // Eject old interceptor before adding new one
    if (interceptorRef.current !== null) {
      api.interceptors.response.eject(interceptorRef.current);
    }

    interceptorRef.current = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
        return Promise.reject(error);
      }
    );
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }
      setupAxios(token);
      try {
        const response = await api.get('/api/auth/profile');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.data.user, token }
        });
      } catch {
        localStorage.removeItem('token');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // FIXED: use useCallback so clearError has a stable reference
  // Without this, Login.jsx's useEffect([clearError]) fires on every render → infinite loop
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setupAxios(token);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } });
      return { success: true, user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [setupAxios]);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setupAxios(token);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } });
      return { success: true, user, token };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [setupAxios]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData);
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data.user });
      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!state.token && !!state.user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export { api };
