import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { coursesAPI } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/Loading';
import { BookOpen, Users, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { StatsCard } from '../../components/ui/StatsCard';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const statsRes = await coursesAPI.getInstructorStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Good Morning, {user?.first_name}!</h1>
        <p className="text-[var(--text-secondary)]">Welcome back to your teaching dashboard</p>
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
          label="Students enrolled"
          value={stats?.total_students || 0}
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
          label="Pending"
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

export default InstructorDashboard;
