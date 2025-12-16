import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentsAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { LoadingPage } from '../../components/ui/Loading';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Clock, BookOpen, User } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  useEffect(() => {
    fetchCourseDetail();
  }, [id]);
  
  const fetchCourseDetail = async () => {
    try {
      const response = await coursesAPI.getCourseDetail(id);
      setCourse(response.data);
      
      if (isAuthenticated && user?.role === 'STUDENT') {
        const enrollmentCheck = await enrollmentsAPI.checkEnrollment(id);
        setIsEnrolled(enrollmentCheck.data.is_enrolled);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (course.price > 0) {
      navigate(`/student/courses/${id}/payment`);
      return;
    }
    
    setEnrolling(true);
    try {
      await enrollmentsAPI.enroll(id);
      toast.success('Enrolled successfully!');
      setIsEnrolled(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };
  
  if (loading) return <LoadingPage />;
  if (!course) return <div>Course not found</div>;
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          
          <div className="flex items-center gap-6 text-[var(--text-secondary)] mb-6">
            <div className="flex items-center gap-2">
              <User size={20} />
              <span>{course.instructor?.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={20} />
              <span>{course.lesson_count} lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>{Math.floor(course.total_duration / 60)}h total</span>
            </div>
          </div>
          
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">About this course</h2>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
          
          {course.syllabus && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Syllabus</h2>
              <div className="text-[var(--text-secondary)] whitespace-pre-wrap">
                {course.syllabus}
              </div>
            </div>
          )}
          
          {course.lessons?.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                    <div>
                      <span className="text-sm text-[var(--text-secondary)]">Lesson {index + 1}</span>
                      <h4 className="font-semibold">{lesson.title}</h4>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">{lesson.duration}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div>
          <div className="card sticky top-24">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">
                {formatPrice(course.price)}
              </div>
            </div>
            
            {isEnrolled ? (
              <Button className="w-full" onClick={() => navigate('/student/my-courses')}>
                Go to My Courses
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
