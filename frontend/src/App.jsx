import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PasswordReset from './pages/auth/PasswordReset';
import CourseCatalog from './pages/courses/CourseCatalog';
import CourseDetail from './pages/courses/CourseDetail';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CourseLearning from './pages/student/CourseLearning';
import TakeQuiz from './pages/student/TakeQuiz';
import PaymentPage from './pages/student/PaymentPage';
import SubmitAssignment from './pages/student/SubmitAssignment';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorMyCourses from './pages/instructor/MyCourses';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import CourseContent from './pages/instructor/CourseContent';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingCourses from './pages/admin/PendingCourses';
import ReviewCourse from './pages/admin/ReviewCourse';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#161616',
            color: '#fff',
            border: '1px solid #2a2a2a',
          },
          success: {
            iconTheme: {
              primary: '#94C705',
              secondary: '#000',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<PasswordReset />} />
          <Route path="courses" element={<CourseCatalog />} />
          <Route path="courses/:id" element={<CourseDetail />} />
        </Route>
        
        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="courses/:courseId/learn" element={<CourseLearning />} />
          <Route path="quizzes/:quizId/take" element={<TakeQuiz />} />
          <Route path="courses/:courseId/payment" element={<PaymentPage />} />
          <Route path="assignments/:assignmentId/submit" element={<SubmitAssignment />} />
        </Route>
        
        {/* Instructor Routes */}
        <Route 
          path="/instructor" 
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="my-courses" element={<InstructorMyCourses />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="courses/:courseId/content" element={<CourseContent />} />
        </Route>
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pending-courses" element={<PendingCourses />} />
          <Route path="review-course/:id" element={<ReviewCourse />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
