import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Video, FileText, Brain, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import AddLessonModal from '../../components/instructor/AddLessonModal';
import AddAssignmentModal from '../../components/instructor/AddAssignmentModal';
import AddQuizModal from '../../components/instructor/AddQuizModal';
import { useAuthStore } from '../../store/authStore';

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch lessons - filter by course
      const lessonsRes = await fetch(`http://localhost:8000/api/courses/${courseId}/lessons/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // Fetch assignments - filter by course
      const assignmentsRes = await fetch(`http://localhost:8000/api/courses/assignments/?course=${courseId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // Fetch quizzes - filter by course
      const quizzesRes = await fetch(`http://localhost:8000/api/courses/quizzes/?course=${courseId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];
      const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : [];
      const quizzesData = quizzesRes.ok ? await quizzesRes.json() : [];

      setLessons(Array.isArray(lessonsData) ? lessonsData : (lessonsData.results || []));
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData.results || []));
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : (quizzesData.results || []));
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'lessons', label: 'Lessons', icon: Video, count: lessons.length },
    { id: 'assignments', label: 'Assignments', icon: FileText, count: assignments.length },
    { id: 'quizzes', label: 'Quizzes', icon: Brain, count: quizzes.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#94C705] mx-auto mb-4"></div>
          <p className="text-[#999999]">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/instructor/my-courses')}
            className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white">{course?.title}</h1>
            <p className="text-[#999999] mt-2">Manage your course content</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#252525]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#94C705] text-white'
                  : 'border-transparent text-[#999999] hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{tab.label}</span>
              <span className="px-2 py-1 rounded-full bg-[#252525] text-sm">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Course Lessons</h2>
              <Button
                onClick={() => setShowLessonModal(true)}
                variant="primary"
                icon={Plus}
              >
                Add Lesson
              </Button>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-16 bg-[#161616] border-2 border-[#252525] rounded-3xl">
                <Video size={48} className="mx-auto mb-4 text-[#666666]" />
                <h3 className="text-xl font-bold text-white mb-2">No lessons yet</h3>
                <p className="text-[#999999] mb-6">Start building your course by adding lessons</p>
                <Button
                  onClick={() => setShowLessonModal(true)}
                  variant="primary"
                  icon={Plus}
                >
                  Add Your First Lesson
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl hover:border-[#94C705]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[#666666] font-medium">Lesson {lesson.order}</span>
                          <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                        </div>
                        <div 
                          className="text-[#999999] mb-4"
                          dangerouslySetInnerHTML={{ __html: lesson.description }}
                        />
                        <div className="flex items-center gap-4 text-sm text-[#666666]">
                          <span>{lesson.duration} minutes</span>
                          <span>•</span>
                          <span className="capitalize">{lesson.media_type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white">
                          <Edit size={20} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-600/20 transition-colors text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Assignments</h2>
              <Button
                onClick={() => setShowAssignmentModal(true)}
                variant="primary"
                icon={Plus}
              >
                Create Assignment
              </Button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-16 bg-[#161616] border-2 border-[#252525] rounded-3xl">
                <FileText size={48} className="mx-auto mb-4 text-[#666666]" />
                <h3 className="text-xl font-bold text-white mb-2">No assignments yet</h3>
                <p className="text-[#999999] mb-6">Create assignments to assess your students</p>
                <Button
                  onClick={() => setShowAssignmentModal(true)}
                  variant="primary"
                  icon={Plus}
                >
                  Create First Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl hover:border-[#94C705]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
                        <p className="text-[#999999] mb-4">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-[#666666]">
                          <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Max Score: {assignment.max_score}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white">
                          <Edit size={20} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-600/20 transition-colors text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Quizzes</h2>
              <Button
                onClick={() => setShowQuizModal(true)}
                variant="primary"
                icon={Plus}
              >
                Create Quiz
              </Button>
            </div>

            {quizzes.length === 0 ? (
              <div className="text-center py-16 bg-[#161616] border-2 border-[#252525] rounded-3xl">
                <Brain size={48} className="mx-auto mb-4 text-[#666666]" />
                <h3 className="text-xl font-bold text-white mb-2">No quizzes yet</h3>
                <p className="text-[#999999] mb-6">Test your students' knowledge with quizzes</p>
                <Button
                  onClick={() => setShowQuizModal(true)}
                  variant="primary"
                  icon={Plus}
                >
                  Create First Quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl hover:border-[#94C705]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                        <p className="text-[#999999] mb-4">{quiz.description}</p>
                        <div className="flex items-center gap-4 text-sm text-[#666666]">
                          <span>{quiz.duration} minutes</span>
                          <span>•</span>
                          <span>Passing: {quiz.passing_score}%</span>
                          <span>•</span>
                          <span>Max Attempts: {quiz.max_attempts}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white">
                          <Edit size={20} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-600/20 transition-colors text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddLessonModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        courseId={courseId}
        onSuccess={fetchCourseData}
      />
      <AddAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        courseId={courseId}
        onSuccess={fetchCourseData}
      />
      <AddQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        courseId={courseId}
        onSuccess={fetchCourseData}
      />
    </div>
  );
};

export default CourseContent;
