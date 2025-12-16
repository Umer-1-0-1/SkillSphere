import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      const { user, access_token, refresh_token } = response.data;
      
      setAuth(user, access_token, refresh_token);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'STUDENT') navigate('/student');
      else if (user.role === 'INSTRUCTOR') navigate('/instructor');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>SKILLSPHERE</h1>
            <p className="text-[#999999]">Welcome back! Please login to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Email or Username
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div className="text-right">
              <Link 
                to="/reset-password" 
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-[#999999]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--primary)] hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
