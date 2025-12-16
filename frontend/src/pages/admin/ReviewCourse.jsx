import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/Input';
import { LoadingPage } from '../../components/ui/Loading';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, User, BookOpen, Clock } from 'lucide-react';

const ReviewCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  useEffect(() => {
    fetchCourse();
  }, [id]);
  
  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.reviewCourse(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this course?')) return;
    
    setSubmitting(true);
    try {
      await coursesAPI.approveCourse(id, {
        status: 'APPROVED',
        admin_comment: adminComment,
      });
      toast.success('Course approved successfully!');
      navigate('/admin/pending-courses');
    } catch (error) {
      toast.error('Failed to approve course');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!adminComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setSubmitting(true);
    try {
      await coursesAPI.approveCourse(id, {
        status: 'REJECTED',
        admin_comment: adminComment,
      });
      toast.success('Course rejected');
      navigate('/admin/pending-courses');
    } catch (error) {
      toast.error('Failed to reject course');
    } finally {
      setSubmitting(false);
      setShowRejectModal(false);
    }
  };
  
  if (loading) return <LoadingPage />;
  if (!course) return <div>Course not found</div>;
  
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Review Course</h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowRejectModal(true)}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <XCircle size={20} />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <CheckCircle size={20} />
            Approve
          </Button>
        </div>
      </div>
      
      {/* Course Details */}
      <div className="space-y-6">
        <div className="card">
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <h2 className="text-3xl font-bold mb-4">{course.title}</h2>
          
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
            <div className="text-[var(--primary)] font-bold text-xl">
              {formatPrice(course.price)}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Description</h3>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
          
          {course.syllabus && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Syllabus</h3>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                {course.syllabus}
              </p>
            </div>
          )}
          
          {course.lessons?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">Course Content</h3>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-[var(--text-secondary)]">
                          Lesson {index + 1}
                        </span>
                        <h4 className="font-semibold">{lesson.title}</h4>
                        {lesson.description && (
                          <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {lesson.duration}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Admin Comment */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Admin Comments (Optional)</h3>
          <TextArea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Add feedback or comments for the instructor..."
            rows={4}
          />
        </div>
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Reject Course</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Please provide a reason for rejecting this course. This will be sent to the instructor.
            </p>
            <TextArea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              required
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={submitting || !adminComment.trim()}
                className="flex-1"
              >
                {submitting ? 'Rejecting...' : 'Reject Course'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCourse;
