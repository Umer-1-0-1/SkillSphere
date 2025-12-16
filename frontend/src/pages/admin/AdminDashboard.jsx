import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { coursesAPI } from '../../lib/api';
import { BookOpen, Clock, CheckCircle, XCircle, Users, DollarSign } from 'lucide-react';
import { StatsCard } from '../../components/ui/StatsCard';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await coursesAPI.getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Good Morning, {user?.first_name}!</h1>
        <p className="text-[var(--text-secondary)]">Welcome back to your admin dashboard</p>
      </div>
      
      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          icon={BookOpen}
          label="Total courses"
          value={stats?.total_courses || 0}
          iconColor="text-[#94C705]"
          valueColor="text-[#94C705]"
        />
        
        <StatsCard 
          icon={Users}
          label="Total users"
          value={stats?.total_users || 0}
          iconColor="text-blue-500"
          valueColor="text-blue-500"
        />
        
        <StatsCard 
          icon={DollarSign}
          label="Total revenue"
          value={`$${stats?.total_revenue || 0}`}
          iconColor="text-green-500"
          valueColor="text-green-500"
        />
      </div>
      
      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          icon={Clock}
          label="Pending approval"
          value={stats?.pending_courses || 0}
          iconColor="text-yellow-500"
          valueColor="text-yellow-500"
        />
        
        <StatsCard 
          icon={CheckCircle}
          label="Approved"
          value={stats?.approved_courses || 0}
          iconColor="text-green-500"
          valueColor="text-green-500"
        />
        
        <StatsCard 
          icon={XCircle}
          label="Rejected"
          value={stats?.rejected_courses || 0}
          iconColor="text-red-500"
          valueColor="text-red-500"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
