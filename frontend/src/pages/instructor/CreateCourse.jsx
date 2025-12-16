import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    syllabus: '',
    category: '',
    price: 0,
    thumbnail_url: null,
    status: 'DRAFT',
  });
  
  useEffect(() => {
    console.log('CreateCourse component mounted');
    fetchCategories();
    
    return () => {
      console.log('CreateCourse component unmounting');
    };
  }, []);
  
  const fetchCategories = async () => {
    try {
      const response = await coursesAPI.getCategories();
      console.log('Categories fetched:', response.data);
      // Extract the results array from the paginated response
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnail_url') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });
    data.set('status', status);
    
    try {
      await coursesAPI.createCourse(data);
      toast.success(`Course ${status === 'DRAFT' ? 'saved as draft' : 'submitted for approval'}!`);
      navigate('/instructor');
    } catch (error) {
      const errors = error.response?.data;
      if (typeof errors === 'object') {
        Object.values(errors).forEach(err => toast.error(Array.isArray(err) ? err[0] : err));
      } else {
        toast.error('Failed to create course');
      }
    } finally {
      setLoading(false);
    }
  };
  
  console.log('Rendering CreateCourse, categories:', categories.length);
  
  return (
    <div className="max-w-4xl mx-auto p-6" style={{backgroundColor: '#1a1a1a', minHeight: '100vh'}}>
      <h1 className="text-4xl font-bold mb-8 text-white" style={{color: 'white'}}>Create New Course</h1>
      
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-8" style={{backgroundColor: '#161616', border: '1px solid #2a2a2a'}}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter course title"
              required
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94C705]"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn"
              rows={5}
              required
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94C705] resize-vertical"
            />
          </div>
          
          {/* Syllabus */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Syllabus
            </label>
            <textarea
              name="syllabus"
              value={formData.syllabus}
              onChange={handleChange}
              placeholder="Course outline and topics covered"
              rows={5}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94C705] resize-vertical"
            />
          </div>
          
          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#94C705]"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Price (USD)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0 for free"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94C705]"
              />
            </div>
          </div>
          
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Course Thumbnail</label>
            <input
              type="file"
              name="thumbnail_url"
              onChange={handleChange}
              accept="image/*"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#94C705] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#94C705] file:text-black file:cursor-pointer hover:file:opacity-90"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              disabled={loading}
              className="px-6 py-3 bg-[#2a2a2a] text-[#94C705] border-2 border-[#94C705] rounded-lg font-semibold hover:bg-[#94C705] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'PENDING')}
              disabled={loading}
              className="px-6 py-3 bg-[#94C705] text-black rounded-lg font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
