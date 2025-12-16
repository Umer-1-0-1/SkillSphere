import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/Loading';
import { formatPrice } from '../../lib/utils';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PendingCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchPendingCourses();
  }, []);
  
  const fetchPendingCourses = async () => {
    try {
      const response = await coursesAPI.getPendingCourses();
      setCourses(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (courseId) => {
    try {
      await coursesAPI.approveCourse(courseId);
      toast.success('Course approved successfully');
      fetchPendingCourses();
    } catch (error) {
      toast.error('Failed to approve course');
      console.error('Error approving course:', error);
    }
  };
  
  const handleReject = async (courseId) => {
    try {
      await coursesAPI.rejectCourse(courseId);
      toast.success('Course rejected');
      fetchPendingCourses();
    } catch (error) {
      toast.error('Failed to reject course');
      console.error('Error rejecting course:', error);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Pending Courses</h1>
      
      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)]">No pending courses to review</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-white">Course Title</th>
                  <th className="text-left p-4 text-white">Instructor</th>
                  <th className="text-left p-4 text-white">Category</th>
                  <th className="text-left p-4 text-white">Price</th>
                  <th className="text-left p-4 text-white">Submitted</th>
                  <th className="text-center p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]">
                    <td className="p-4 font-semibold text-white">{course.title}</td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {course.instructor?.full_name}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {course.category?.name}
                    </td>
                    <td className="p-4 text-white">{formatPrice(course.price)}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/review-course/${course.id}`}>
                          <button className="bg-[#202020] text-white px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-all flex items-center gap-1 text-sm">
                            <Eye size={14} />
                            Review
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleApprove(course.id)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-1 text-sm"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(course.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-1 text-sm"
                        >
                          <XCircle size={14} />
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCourses;
