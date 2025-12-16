import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Brain } from 'lucide-react';
import FormInput from '../ui/FormInput';
import FormTextarea from '../ui/FormTextarea';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useAuthStore } from '../../store/authStore';

const AddQuizModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    passing_score: 70,
    max_attempts: 3
  });
  const [questions, setQuestions] = useState([{
    id: Date.now(),
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    points: 1,
    order: 0
  }]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      id: Date.now(),
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      points: 1,
      order: prev.length
    }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id).map((q, idx) => ({ ...q, order: idx })));
    }
  };

  const moveQuestion = (id, direction) => {
    const index = questions.findIndex(q => q.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions.map((q, idx) => ({ ...q, order: idx })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate questions
    const invalidQuestion = questions.find(q => 
      !q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d
    );
    
    if (invalidQuestion) {
      alert('Please fill in all question fields');
      return;
    }

    setLoading(true);

    try {
      // Create quiz
      const quizResponse = await fetch(`http://localhost:8000/api/courses/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ...formData, course: courseId })
      });

      if (!quizResponse.ok) {
        throw new Error('Failed to create quiz');
      }

      const quiz = await quizResponse.json();

      // Create questions
      const questionPromises = questions.map((q, index) => 
        fetch(`http://localhost:8000/api/courses/questions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            quiz: quiz.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            points: q.points,
            order: index
          })
        })
      );

      await Promise.all(questionPromises);

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      duration: 30,
      passing_score: 70,
      max_attempts: 3
    });
    setQuestions([{
      id: Date.now(),
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      points: 1,
      order: 0
    }]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Quiz" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <div className="space-y-4 p-6 bg-[#0F0F0F] border-2 border-[#252525] rounded-2xl">
          <h3 className="text-xl font-bold text-white">Quiz Details</h3>
          
          <FormInput
            label="Quiz Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter quiz title"
            required
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the quiz"
            rows={2}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              min={1}
              required
            />

            <FormInput
              label="Passing Score (%)"
              name="passing_score"
              type="number"
              value={formData.passing_score}
              onChange={handleChange}
              min={1}
              max={100}
              required
            />

            <FormInput
              label="Max Attempts"
              name="max_attempts"
              type="number"
              value={formData.max_attempts}
              onChange={handleChange}
              min={1}
              required
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Questions ({questions.length})</h3>
            <Button
              type="button"
              variant="primary"
              onClick={addQuestion}
              icon={Plus}
            >
              Add Question
            </Button>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="p-6 bg-[#0F0F0F] border-2 border-[#252525] rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">Question {index + 1}</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown size={20} />
                  </button>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="p-2 rounded-lg hover:bg-red-600/20 transition-colors text-red-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <FormTextarea
                label="Question"
                name={`question_${question.id}`}
                value={question.question_text}
                onChange={(e) => handleQuestionChange(question.id, 'question_text', e.target.value)}
                placeholder="Enter your question"
                rows={2}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Option A"
                  name={`option_a_${question.id}`}
                  value={question.option_a}
                  onChange={(e) => handleQuestionChange(question.id, 'option_a', e.target.value)}
                  placeholder="Option A"
                  required
                />
                <FormInput
                  label="Option B"
                  name={`option_b_${question.id}`}
                  value={question.option_b}
                  onChange={(e) => handleQuestionChange(question.id, 'option_b', e.target.value)}
                  placeholder="Option B"
                  required
                />
                <FormInput
                  label="Option C"
                  name={`option_c_${question.id}`}
                  value={question.option_c}
                  onChange={(e) => handleQuestionChange(question.id, 'option_c', e.target.value)}
                  placeholder="Option C"
                  required
                />
                <FormInput
                  label="Option D"
                  name={`option_d_${question.id}`}
                  value={question.option_d}
                  onChange={(e) => handleQuestionChange(question.id, 'option_d', e.target.value)}
                  placeholder="Option D"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#999999]">
                    Correct Answer <span className="text-[#94C705]">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['A', 'B', 'C', 'D'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct_${question.id}`}
                          value={option}
                          checked={question.correct_answer === option}
                          onChange={(e) => handleQuestionChange(question.id, 'correct_answer', e.target.value)}
                          className="w-4 h-4 accent-[#94C705]"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <FormInput
                  label="Points"
                  name={`points_${question.id}`}
                  type="number"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>
          ))}
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
            icon={Brain}
          >
            Create Quiz
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddQuizModal;
