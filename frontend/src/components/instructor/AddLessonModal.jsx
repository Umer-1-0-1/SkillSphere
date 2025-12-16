import React, { useState } from 'react';
import { Plus, Video, Link as LinkIcon, Upload, X } from 'lucide-react';
import FormInput from '../ui/FormInput';
import FormTextarea from '../ui/FormTextarea';
import FormSelect from '../ui/FormSelect';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import RichTextEditor from '../ui/RichTextEditor';
import { useAuthStore } from '../../store/authStore';

const AddLessonModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    duration: 0,
    videoType: 'upload',
    videoFile: null,
    videoLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoTypeOptions = [
    { value: 'upload', label: 'Upload Video File' },
    { value: 'youtube', label: 'YouTube Link' },
    { value: 'google_drive', label: 'Google Drive Link' },
    { value: 'vimeo', label: 'Vimeo Link' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, videoFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('order', formData.order);
      data.append('duration', formData.duration);
      data.append('course', courseId);

      if (formData.videoType === 'upload' && formData.videoFile) {
        data.append('media_type', 'VIDEO');
        data.append('video_url', formData.videoFile);
      } else if (formData.videoLink) {
        data.append('media_type', 'EXTERNAL');
        data.append('external_link', formData.videoLink);
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/lessons/`, {
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lesson creation error:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to create lesson');
      }

      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 500);
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert(`Failed to create lesson: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      order: 1,
      duration: 0,
      videoType: 'upload',
      videoFile: null,
      videoLink: ''
    });
    setUploadProgress(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Lesson" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Lesson Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter lesson title"
          required
        />

        <RichTextEditor
          label="Lesson Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what students will learn in this lesson"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Lesson Order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            min={1}
            required
          />

          <FormInput
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            min={0}
            required
          />
        </div>

        <div className="space-y-4">
          <FormSelect
            label="Video Type"
            name="videoType"
            value={formData.videoType}
            onChange={handleChange}
            options={videoTypeOptions}
            required
          />

          {formData.videoType === 'upload' ? (
            <FileUpload
              label="Video File"
              name="videoFile"
              onChange={handleFileChange}
              accept="video/mp4,video/mov,video/avi,video/mkv"
              maxSize={500}
              helperText="MP4, MOV, AVI, or MKV (max 500MB)"
              required
            />
          ) : (
            <FormInput
              label="Video Link"
              name="videoLink"
              value={formData.videoLink}
              onChange={handleChange}
              placeholder={`Enter ${formData.videoType.replace('_', ' ')} link`}
              required
            />
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#999999]">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#252525] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#94C705] h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            fullWidth
          >
            Add Lesson
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLessonModal;
