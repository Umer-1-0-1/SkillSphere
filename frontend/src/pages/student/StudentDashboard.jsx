import { useEffect, useState } from 'react';
import { enrollmentsAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award } from 'lucide-react';
import { StatsCard } from '../../components/ui/StatsCard';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [statsRes, coursesRes] = await Promise.all([
        enrollmentsAPI.getStudentStats(),
        enrollmentsAPI.getMyEnrollments(),
      ]);
      setStats(statsRes.data);
      setRecentCourses(coursesRes.data.results?.slice(0, 3) || coursesRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
      // Error will be handled by API interceptor - user will be signed out if session expired
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Good Morning, {user?.first_name}!</h1>
        <p className="text-[var(--text-secondary)]">Welcome back to your learning journey</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          icon={Clock}
          label="Time spent"
          value={`${stats?.total_hours_spent || 0}h`}
          iconColor="text-[#94C705]"
          valueColor="text-[#94C705]"
        />
        
        <StatsCard 
          icon={BookOpen}
          label="Courses enrolled"
          value={stats?.total_enrolled || 0}
          iconColor="text-blue-500"
          valueColor="text-blue-500"
        />
        
        <StatsCard 
          icon={Award}
          label="Completed"
          value={stats?.completed_courses || 0}
          iconColor="text-green-500"
          valueColor="text-green-500"
        />
      </div>
      
      {/* Continue Learning */}
      {recentCourses.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <Link to="/student/my-courses" className="text-[var(--primary)] hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentCourses.map((enrollment) => (
              <Link
                key={enrollment.id}
                to={`/courses/${enrollment.course.id}`}
                className="block"
              >
                <div className="bg-[#161616] border-2 border-[#252525] rounded-2xl p-6 hover:border-[#94C705] transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    {enrollment.course.thumbnail_url && (
                      <img
                        src={enrollment.course.thumbnail_url}
                        alt={enrollment.course.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">{enrollment.course.title}</h3>
                    </div>
                  </div>
                  <div className="w-full bg-[#0F0F0F] rounded-full h-2 mb-2">
                    <div
                      className="bg-[var(--primary)] h-2 rounded-full"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] text-right">
                    {enrollment.progress}% complete
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
