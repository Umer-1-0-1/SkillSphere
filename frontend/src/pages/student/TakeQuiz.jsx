import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, result]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !result) {
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
    }
  }, [answers, quizId, result]);

  const fetchQuizData = async () => {
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        fetch(`/api/courses/quizzes/${quizId}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`/api/courses/quizzes/${quizId}/attempts/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      const [quizData, attemptsData] = await Promise.all([
        quizRes.json(),
        attemptsRes.json()
      ]);

      setQuiz(quizData);
      
      // Get questions from quiz data if available
      const questionsData = quizData.questions || [];
      console.log('[DEBUG] Quiz questions received:', questionsData);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      
      setAttempts(attemptsData.attempts || attemptsData.attempt_count || 0);
      setTimeLeft(quizData.duration * 60); // Convert minutes to seconds

      // Restore saved answers
      const saved = localStorage.getItem(`quiz_${quizId}_answers`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async (skipConfirm = false) => {
    if (!skipConfirm) {
      setShowConfirm(true);
      return;
    }

    setSubmitting(true);
    setShowConfirm(false);

    try {
      const response = await fetch(`/api/courses/quizzes/${quizId}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const resultData = await response.json();
      console.log('[DEBUG] Quiz result received:', resultData);
      setResult(resultData);
      
      // If result includes questions with correct answers, update questions state
      if (resultData.questions) {
        setQuestions(resultData.questions);
      }
      
      localStorage.removeItem(`quiz_${quizId}_answers`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isPassed = () => {
    return result && result.percentage >= quiz.passing_score;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#94C705] mx-auto mb-4"></div>
          <p className="text-[#999999]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center p-12 bg-[#161616] border-2 border-[#252525] rounded-3xl">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isPassed() ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <span className={`text-5xl font-bold ${isPassed() ? 'text-green-500' : 'text-red-500'}`}>
              {result.percentage}%
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            {isPassed() ? 'Congratulations! You Passed!' : 'Quiz Completed'}
          </h2>
          
          <p className="text-xl text-[#999999] mb-8">
            You scored {result.score} out of {result.total_points} points
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-[#0F0F0F] rounded-2xl">
              <p className="text-[#666666] mb-2">Score</p>
              <p className="text-2xl font-bold text-white">{result.percentage}%</p>
            </div>
            <div className="p-4 bg-[#0F0F0F] rounded-2xl">
              <p className="text-[#666666] mb-2">Correct</p>
              <p className="text-2xl font-bold text-green-500">{result.correct_count}/{questions.length}</p>
            </div>
            <div className="p-4 bg-[#0F0F0F] rounded-2xl">
              <p className="text-[#666666] mb-2">Attempt</p>
              <p className="text-2xl font-bold text-white">{attempts + 1}/{quiz.max_attempts}</p>
            </div>
          </div>

          <div className="flex gap-4">
            {attempts + 1 < quiz.max_attempts && !isPassed() && (
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                fullWidth
              >
                Try Again
              </Button>
            )}
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              fullWidth
            >
              Back to Course
            </Button>
          </div>
        </div>

        {/* Review Answers */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Review Your Answers</h3>
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            
            console.log(`[DEBUG] Question ${question.id}: userAnswer="${userAnswer}", correct="${question.correct_answer}", match=${isCorrect}`);
            
            return (
              <div key={question.id} className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Question {index + 1}</h4>
                  <div className={`px-4 py-2 rounded-full font-medium ${
                    isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
                
                <p className="text-white mb-4">{question.question_text}</p>
                
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map(option => {
                    const optionText = question[`option_${option.toLowerCase()}`];
                    const isUserAnswer = userAnswer === option;
                    const isCorrectAnswer = question.correct_answer === option;
                    
                    return (
                      <div
                        key={option}
                        className={`p-4 rounded-xl border-2 ${
                          isCorrectAnswer
                            ? 'border-green-500 bg-green-500/10'
                            : isUserAnswer
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-[#252525] bg-[#0F0F0F]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{option}.</span>
                          <span className="text-white">{optionText}</span>
                          {isCorrectAnswer && (
                            <span className="ml-auto text-green-500 text-sm font-medium">Correct Answer</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-auto text-red-500 text-sm font-medium">Your Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Check if can take quiz
  if (attempts >= quiz.max_attempts) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center p-12 bg-[#161616] border-2 border-[#252525] rounded-3xl">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#666666]" />
          <h2 className="text-2xl font-bold text-white mb-4">Maximum Attempts Reached</h2>
          <p className="text-[#999999] mb-6">
            You have used all {quiz.max_attempts} attempts for this quiz.
          </p>
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            {quiz.description && <p className="text-[#999999] mt-1">{quiz.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[#666666] text-sm mb-1">Time Left</p>
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <Clock size={24} className={timeLeft < 60 ? 'text-red-500' : 'text-[#94C705]'} />
              <span className={timeLeft < 60 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#666666] text-sm mb-1">Answered</p>
            <p className="text-2xl font-bold text-white">{getAnsweredCount()}/{questions.length}</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-[#666666] font-medium">Q{index + 1}.</span>
              <div className="flex-1">
                <p className="text-xl text-white mb-2">{question.question_text}</p>
                <p className="text-sm text-[#666666]">{question.points} point{question.points !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(option => (
                <label
                  key={option}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                    answers[question.id] === option
                      ? 'bg-[#94C705]/10 border-2 border-[#94C705]'
                      : 'bg-[#0F0F0F] border-2 border-transparent hover:border-[#252525]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                    className="w-5 h-5 accent-[#94C705]"
                  />
                  <span className="font-bold text-white">{option}.</span>
                  <span className="flex-1 text-white">{question[`option_${option.toLowerCase()}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-6 p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              {getAnsweredCount()} of {questions.length} questions answered
            </p>
            <p className="text-[#666666] text-sm mt-1">
              Attempt {attempts + 1} of {quiz.max_attempts}
            </p>
          </div>
          <Button
            onClick={() => handleSubmit()}
            variant="primary"
            disabled={getAnsweredCount() < questions.length}
            loading={submitting}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Submit Quiz?">
        <div className="space-y-6">
          <p className="text-[#999999]">
            Are you sure you want to submit? You have answered {getAnsweredCount()} out of {questions.length} questions.
          </p>
          {getAnsweredCount() < questions.length && (
            <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl">
              <p className="text-yellow-500">
                Warning: You haven't answered all questions. Unanswered questions will be marked as incorrect.
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <Button onClick={() => setShowConfirm(false)} variant="secondary" fullWidth>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(true)} variant="primary" fullWidth>
              Confirm Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TakeQuiz;
