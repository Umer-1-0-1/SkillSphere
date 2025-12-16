import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentsAPI } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Play, BookOpen } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEnrollments();
  }, []);
  
  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-white">My Courses</h1>
      
      {enrollments.length === 0 ? (
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl text-center py-12">
          <p className="text-[#999999] mb-4">You haven't enrolled in any courses yet</p>
          <Link to="/courses">
            <button className="bg-[#94C705] hover:bg-[#7ba004] text-black font-semibold py-3 px-6 rounded-2xl transition-colors flex items-center gap-2 mx-auto">
              <BookOpen className="w-5 h-5" />
              Browse Courses
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-[#161616] border-2 border-[#252525] rounded-3xl overflow-hidden hover:border-[#94C705] transition-all">
              {/* Thumbnail */}
              <div className="relative w-full h-48 bg-[#252525]">
                {enrollment.course.thumbnail_url ? (
                  <img
                    src={enrollment.course.thumbnail_url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-[#666666]" />
                  </div>
                )}
                
                {enrollment.course.price === 0 && (
                  <div className="absolute top-3 right-3 bg-[#94C705] text-black px-3 py-1 rounded-full text-xs font-bold">
                    FREE
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white line-clamp-2 mb-2">
                  {enrollment.course.title}
                </h3>
                
                <p className="text-sm text-[#999999] line-clamp-2 mb-4">
                  {enrollment.course.description}
                </p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-[#666666]">
                  <span>{enrollment.course.instructor_name || enrollment.course.instructor?.full_name}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-[#252525] rounded-full h-2 mb-2">
                    <div
                      className="bg-[#94C705] h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-[#999999] text-right">
                    {enrollment.progress || 0}% complete
                  </p>
                </div>

                {/* Start Learning Button */}
                <button
                  onClick={() => navigate(`/student/courses/${enrollment.course.id}/learn`)}
                  className="w-full bg-[#94C705] hover:bg-[#7ba004] text-black font-semibold py-2 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
