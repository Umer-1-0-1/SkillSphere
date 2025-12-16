import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../lib/api';
import { CourseCard } from '../../components/ui/CourseCard';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Search } from 'lucide-react';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    is_free: '',
  });
  
  useEffect(() => {
    fetchData();
  }, [filters]);
  
  const fetchData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        coursesAPI.getPublicCourses(filters),
        coursesAPI.getCategories(),
      ]);
      setCourses(coursesRes.data.results || coursesRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="container mx-auto px-6 py-16">
      {/* Heading - Centered */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-white mb-4" style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
          Explore Courses
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
          Discover amazing courses from expert instructors
        </p>
      </div>
      
      {/* Search Bar - Centered */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full bg-[#202020] text-white px-12 py-4 rounded-2xl border border-[#252525] focus:outline-none focus:border-[var(--primary)] transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>
      
      {/* Filters - Left Aligned */}
      <div className="flex flex-wrap gap-4 mb-12">
        <div className="relative">
          <select
            className="bg-[#202020] text-white pl-6 pr-12 py-3 rounded-2xl border border-[#252525] focus:outline-none focus:border-[var(--primary)] transition-all cursor-pointer appearance-none"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none">▼</span>
        </div>
        
        <div className="relative">
          <select
            className="bg-[#202020] text-white pl-6 pr-12 py-3 rounded-2xl border border-[#252525] focus:outline-none focus:border-[var(--primary)] transition-all cursor-pointer appearance-none"
            value={filters.is_free}
            onChange={(e) => setFilters({ ...filters, is_free: e.target.value })}
          >
            <option value="">All Prices</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none">▼</span>
        </div>
      </div>
      
      {/* Course Grid - 3 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No courses found</p>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
