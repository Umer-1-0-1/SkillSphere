import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import FormInput from '../ui/FormInput';
import FormTextarea from '../ui/FormTextarea';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import RichTextEditor from '../ui/RichTextEditor';
import { useAuthStore } from '../../store/authStore';

const AddAssignmentModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    deadline: '',
    max_score: 100
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/courses/assignments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ...formData, course: courseId })
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      instructions: '',
      deadline: '',
      max_score: 100
    });
    onClose();
  };

  // Get minimum datetime (current date/time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Assignment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Assignment Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter assignment title"
          required
        />

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of the assignment"
          rows={3}
          required
        />

        <RichTextEditor
          label="Instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          placeholder="Detailed instructions for students..."
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Deadline"
            name="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={handleChange}
            min={getMinDateTime()}
            required
          />

          <FormInput
            label="Maximum Score"
            name="max_score"
            type="number"
            value={formData.max_score}
            onChange={handleChange}
            min={1}
            max={1000}
            required
          />
        </div>

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
            icon={FileText}
          >
            Create Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAssignmentModal;
