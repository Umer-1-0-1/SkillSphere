import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { useAuthStore } from '../../store/authStore';

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (accessToken) {
      fetchAssignment();
    }
  }, [assignmentId, accessToken]);

  const fetchAssignment = async () => {
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        fetch(`/api/courses/assignments/${assignmentId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }),
        fetch(`/api/courses/assignments/${assignmentId}/my_submission/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      ]);
      
      if (assignmentRes.ok) {
        const data = await assignmentRes.json();
        setAssignment(data);
      } else {
        setError('Failed to load assignment');
      }
      
      if (submissionRes.ok) {
        const submissionData = await submissionRes.json();
        if (submissionData.submitted) {
          setExistingSubmission(submissionData.submission);
        }
      }
    } catch (error) {
      setError('Error loading assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target?.files?.[0] || e;
    setFile(selectedFile);
    setError('');
  };

  const isLate = () => {
    if (!assignment) return false;
    return new Date() > new Date(assignment.deadline);
  };

  const formatDeadline = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!assignment) return '';
    
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const diff = deadline - now;
    
    if (diff < 0) return 'Past due';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/courses/assignments/${assignmentId}/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          navigate(`/student/courses/${assignment.course}/learn`);
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit assignment');
      }
    } catch (error) {
      setError('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-red-500">Assignment not found</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-[#94C705] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Assignment {existingSubmission ? 'Resubmitted' : 'Submitted'}!
          </h2>
          <p className="text-[#999999] mb-4">
            Your {existingSubmission ? 'resubmission' : 'submission'} has been received successfully.
            {isLate() && (
              <span className="block mt-2 text-yellow-500">
                Note: This submission was marked as late.
              </span>
            )}
          </p>
          <p className="text-sm text-[#666666]">
            Redirecting to course page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-[#94C705]/10 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-[#94C705]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {assignment.title}
              </h1>
              <p className="text-[#999999] mb-4">
                {assignment.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#94C705]" />
                  <span className="text-[#999999]">
                    Due: {formatDeadline(assignment.deadline)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#999999]">
                    Max Score: {assignment.max_score} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Remaining Alert */}
        <div className={`mb-6 p-4 rounded-2xl border-2 flex items-start gap-3 ${
          isLate() 
            ? 'bg-red-500/10 border-red-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
            isLate() ? 'text-red-500' : 'text-yellow-500'
          }`} />
          <div>
            <p className={`font-semibold ${
              isLate() ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {isLate() ? 'Past Deadline' : 'Time Remaining'}
            </p>
            <p className="text-sm text-[#999999] mt-1">
              {isLate() 
                ? 'This assignment is past its deadline. Late submissions may receive reduced credit.'
                : getTimeRemaining()
              }
            </p>
          </div>
        </div>

        {/* Existing Submission Alert */}
        {existingSubmission && (
          <div className="mb-6 p-4 rounded-2xl border-2 bg-blue-500/10 border-blue-500/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-blue-500" />
            <div className="flex-1">
              <p className="font-semibold text-blue-500">Previously Submitted</p>
              <p className="text-sm text-[#999999] mt-1">
                You submitted this assignment on {new Date(existingSubmission.submitted_at).toLocaleString()}.
              </p>
              {existingSubmission.score !== null && (
                <p className="text-sm text-[#999999] mt-1">
                  Score: {existingSubmission.score}/{assignment.max_score}
                </p>
              )}
              {existingSubmission.feedback && (
                <p className="text-sm text-[#999999] mt-1">
                  Feedback: {existingSubmission.feedback}
                </p>
              )}
              <p className="text-sm text-[#94C705] mt-2">
                You can resubmit to replace your previous submission.
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {assignment.instructions && (
          <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Instructions</h2>
            <div 
              className="text-[#999999] prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: assignment.instructions }}
            />
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Submit Your Work</h2>
          
          <form onSubmit={handleSubmit}>
            <FileUpload
              label="Assignment File"
              name="assignment_file"
              currentFile={file?.name}
              onChange={handleFileSelect}
              maxSize={25}
              accept=".pdf,.docx,.doc,.txt,.zip"
              required
              error={error}
            />

            <div className="mt-4 p-4 bg-[#252525] rounded-xl">
              <p className="text-sm text-[#999999]">
                <strong className="text-white">Accepted formats:</strong> PDF, Word Documents (.docx, .doc), Text Files (.txt), ZIP Archives
              </p>
              <p className="text-sm text-[#999999] mt-2">
                <strong className="text-white">Maximum file size:</strong> 25 MB
              </p>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={submitting || !file}
                className="flex-1 bg-[#94C705] hover:bg-[#7ba004] text-black font-semibold py-3 px-6 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (existingSubmission ? 'Resubmitting...' : 'Submitting...') : (existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment')}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-[#252525] hover:bg-[#333333] text-white font-semibold rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssignment;
