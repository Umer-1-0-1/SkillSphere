import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'STUDENT',
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.register(formData);
      const { user, access_token, refresh_token } = response.data;
      
      setAuth(user, access_token, refresh_token);
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (user.role === 'STUDENT') navigate('/student');
      else if (user.role === 'INSTRUCTOR') navigate('/instructor');
      else navigate('/');
    } catch (error) {
      const errors = error.response?.data;
      if (typeof errors === 'object') {
        Object.values(errors).forEach(err => {
          if (Array.isArray(err)) toast.error(err[0]);
          else toast.error(err);
        });
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>Join SKILLSPHERE</h1>
            <p className="text-[#999999]">Create your account and start learning</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#999999] mb-2">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999999] mb-2">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">I am a:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
              </select>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-[#999999]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--primary)] hover:underline font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
