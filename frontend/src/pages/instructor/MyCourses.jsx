import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Plus, Edit, Layers } from 'lucide-react';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getInstructorCourses();
      setCourses(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">My Courses</h1>
        <Link to="/instructor/create-course">
          <button className="bg-[#94C705] hover:bg-[#7ba004] text-black font-semibold py-3 px-6 rounded-2xl transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </Link>
      </div>
      
      {courses.length === 0 ? (
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl text-center py-12 px-6">
          <p className="text-[#999999] mb-4">You haven't created any courses yet</p>
          <Link to="/instructor/create-course">
            <button className="bg-[#94C705] hover:bg-[#7ba004] text-black font-semibold py-3 px-6 rounded-2xl transition-colors">
              Create Your First Course
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-[#161616] border-2 border-[#252525] rounded-3xl overflow-hidden hover:border-[#94C705] transition-all">
              <div className="aspect-video bg-[#252525] relative">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-12 h-12 text-[#666666]" />
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(course.status)}`}>
                  {course.status}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-[#999999] text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-[#666666] mb-4">
                  <span>{course.category_name}</span>
                  <span className="font-semibold text-[#94C705]">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {course.status === 'DRAFT' && (
                    <Link to={`/instructor/edit-course/${course.id}`} className="flex-1">
                      <button className="w-full bg-[#252525] hover:bg-[#333333] text-white font-semibold py-2 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </Link>
                  )}
                  
                  {course.status === 'APPROVED' && (
                    <button 
                      onClick={() => navigate(`/instructor/courses/${course.id}/content`)}
                      className="flex-1 bg-[#94C705] hover:bg-[#7ba004] text-black font-semibold py-2 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      Manage Content
                    </button>
                  )}
                  
                  {course.status === 'REJECTED' && course.admin_comment && (
                    <div className="flex-1 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">
                      Reason: {course.admin_comment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
