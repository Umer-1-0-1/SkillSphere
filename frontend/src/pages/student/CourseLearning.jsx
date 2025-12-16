import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Play, Pause, Volume2, VolumeX, Maximize, Video, FileText, Brain, SkipForward, SkipBack } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (accessToken) {
      fetchCourseData();
    }
  }, [courseId, accessToken]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!videoRef.current || currentLesson?.media_type === 'EXTERNAL' || !duration) return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolumeUp = Math.min(1, volume + 0.1);
          setVolume(newVolumeUp);
          videoRef.current.volume = newVolumeUp;
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolumeDown = Math.max(0, volume - 0.1);
          setVolume(newVolumeDown);
          videoRef.current.volume = newVolumeDown;
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume, duration, currentLesson]);

  useEffect(() => {
    if (lessons.length > 0 && !currentLesson) {
      // Find first incomplete lesson or first lesson
      const firstIncomplete = lessons.find(l => !progress[l.id]?.completed);
      setCurrentLesson(firstIncomplete || lessons[0]);
    }
  }, [lessons, progress]);

  // Reset video state when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackSpeed(1);
  }, [currentLesson?.id]);

  const fetchCourseData = async () => {
    try {
      console.log('[DEBUG] fetchCourseData - accessToken:', accessToken ? 'present' : 'MISSING');
      
      const [courseRes, lessonsRes, assignmentsRes, quizzesRes, progressRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`/api/courses/${courseId}/lessons/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`/api/courses/assignments/?course=${courseId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`/api/courses/quizzes/?course=${courseId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`/api/courses/${courseId}/progress/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      const [courseData, lessonsData, assignmentsData, quizzesData, progressData] = await Promise.all([
        courseRes.json(),
        lessonsRes.json(),
        assignmentsRes.json(),
        quizzesRes.json(),
        progressRes.json()
      ]);

      setCourse(courseData);
      setLessons(lessonsData.results || lessonsData || []);
      setAssignments(assignmentsData.results || assignmentsData || []);
      setQuizzes(quizzesData.results || quizzesData || []);
      
      // Create progress map
      const progressMap = {};
      (progressData.results || progressData || []).forEach(p => {
        if (p.lesson) {
          progressMap[p.lesson] = p;
        }
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    try {
      const response = await fetch(`/api/courses/progress/mark_lesson_complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ lesson_id: currentLesson.id })
      });

      if (response.ok) {
        setProgress(prev => ({
          ...prev,
          [currentLesson.id]: {
            ...prev[currentLesson.id],
            completed: true,
            completion_date: new Date().toISOString()
          }
        }));

        // Move to next lesson
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
          setCurrentLesson(lessons[currentIndex + 1]);
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      console.log('[DEBUG] Video loaded - Duration:', videoDuration);
      setDuration(videoDuration);
      // Ensure playback rate is set
      if (playbackSpeed !== 1) {
        videoRef.current.playbackRate = playbackSpeed;
      }
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) {
      console.log('[DEBUG] Seek failed - videoRef:', !!videoRef.current, 'duration:', duration);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    console.log('[DEBUG] Seek - pos:', pos, 'duration:', duration, 'newTime:', newTime, 'current:', videoRef.current.currentTime);
    
    // Ensure time is within valid range
    videoRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
  };

  const skipBackward = () => {
    if (videoRef.current && duration) {
      const newTime = Math.max(0, videoRef.current.currentTime - 10);
      console.log('[DEBUG] Skip backward - Current:', videoRef.current.currentTime, 'New:', newTime, 'Duration:', duration);
      videoRef.current.currentTime = newTime;
    } else {
      console.log('[DEBUG] Skip backward failed - videoRef:', !!videoRef.current, 'duration:', duration);
    }
  };

  const skipForward = () => {
    if (videoRef.current && duration) {
      const newTime = Math.min(duration, videoRef.current.currentTime + 10);
      console.log('[DEBUG] Skip forward - Current:', videoRef.current.currentTime, 'New:', newTime, 'Duration:', duration);
      videoRef.current.currentTime = newTime;
    } else {
      console.log('[DEBUG] Skip forward failed - videoRef:', !!videoRef.current, 'duration:', duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = (lesson) => {
    if (lesson.media_type === 'VIDEO' && lesson.video_url) {
      return lesson.video_url;
    }
    if (lesson.media_type === 'EXTERNAL' && lesson.external_link) {
      return lesson.external_link;
    }
    return null;
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format: https://drive.google.com/file/d/{FILE_ID}/view
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1]?.split('/')[0];
      }
      // Format: https://drive.google.com/open?id={FILE_ID}
      else if (url.includes('open?id=')) {
        fileId = url.split('open?id=')[1]?.split('&')[0];
      }
      
      if (fileId) {
        // Return preview URL for embedding
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // If already an embed URL or other platform, return as is
    return url;
  };

  const isCompleted = (lessonId) => progress[lessonId]?.completed;

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
          <p className="text-[#999999]">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/student/my-courses')}
          className="p-2 rounded-lg hover:bg-[#252525] transition-colors text-[#999999] hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-white">{course?.title}</h1>
          <p className="text-[#999999] mt-2">
            {lessons.filter(l => isCompleted(l.id)).length} of {lessons.length} lessons completed
          </p>
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

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="col-span-2 space-y-6">
            {currentLesson ? (
              <>
                <div className="bg-[#161616] border-2 border-[#252525] rounded-2xl overflow-hidden">
                  {getVideoUrl(currentLesson) ? (
                    currentLesson.media_type === 'EXTERNAL' ? (
                      // External video (YouTube, Vimeo, etc.)
                      <div className="relative aspect-video bg-black">
                        <iframe
                          src={getEmbedUrl(currentLesson.external_link)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      // Local video with custom controls
                      <div className="relative aspect-video bg-black">
                        <video
                          key={currentLesson.id}
                          ref={videoRef}
                          src={getVideoUrl(currentLesson)}
                          className="w-full h-full"
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onEnded={() => setIsPlaying(false)}
                        />
                        
                        {/* Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-2">
                          {/* Progress Bar */}
                          <div 
                            className="w-full h-1 bg-white/20 rounded-full cursor-pointer group"
                            onClick={handleSeek}
                          >
                            <div 
                              className="h-full bg-[#94C705] rounded-full transition-all group-hover:h-1.5"
                              style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={togglePlay}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                              >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                              </button>
                              
                              <button
                                onClick={skipBackward}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                                title="Rewind 10 seconds (←)"
                              >
                                <SkipBack size={20} />
                              </button>
                              
                              <button
                                onClick={skipForward}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                                title="Forward 10 seconds (→)"
                              >
                                <SkipForward size={20} />
                              </button>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={toggleMute}
                                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                                >
                                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={volume}
                                  onChange={handleVolumeChange}
                                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#94C705]"
                                />
                              </div>
                              
                              <span className="text-white text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Playback Speed */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm font-medium"
                                >
                                  {playbackSpeed}x
                                </button>
                                
                                {showSpeedMenu && (
                                  <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl overflow-hidden">
                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                                      <button
                                        key={speed}
                                        onClick={() => changePlaybackSpeed(speed)}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-[#252525] transition-colors ${
                                          playbackSpeed === speed ? 'text-[#94C705] bg-[#252525]' : 'text-white'
                                        }`}
                                      >
                                        {speed === 1 ? 'Normal' : `${speed}x`}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                              >
                                <Maximize size={24} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-[#0F0F0F]">
                      <p className="text-[#666666]">No video available</p>
                    </div>
                  )}
                </div>

                {/* Lesson Details */}
                <div className="bg-[#161616] border-2 border-[#252525] rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[#666666] font-medium">Lesson {currentLesson.order}</span>
                        <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                      </div>
                      {currentLesson.description && (
                        <div 
                          className="text-[#999999] mb-4"
                          dangerouslySetInnerHTML={{ __html: currentLesson.description }}
                        />
                      )}
                      <div className="flex items-center gap-4 text-sm text-[#666666]">
                        <span>{currentLesson.duration} minutes</span>
                        <span>•</span>
                        <span className="capitalize">{currentLesson.media_type}</span>
                        {currentLesson.external_link && (
                          <>
                            <span>•</span>
                            <a 
                              href={currentLesson.external_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#94C705] hover:underline"
                            >
                              External Link
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      {!isCompleted(currentLesson.id) ? (
                        <Button
                          onClick={handleMarkComplete}
                          className="bg-[#94C705] hover:bg-[#7ba004] text-black"
                        >
                          <CheckCircle size={20} className="mr-2" />
                          Mark as Complete
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-[#94C705] bg-[#94C705]/10 px-4 py-2 rounded-lg">
                          <CheckCircle size={20} />
                          <span className="font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-[#161616] border-2 border-[#252525] rounded-2xl">
                <Video size={48} className="mx-auto mb-4 text-[#666666]" />
                <h3 className="text-xl font-bold text-white mb-2">No lessons available</h3>
                <p className="text-[#999999]">This course doesn't have any lessons yet</p>
              </div>
            )}
          </div>

          {/* Lesson Sidebar */}
          <div className="bg-[#161616] border-2 border-[#252525] rounded-2xl p-6 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Course Content</h3>
            <div className="space-y-2">
              {lessons.map((lesson) => {
                const completed = isCompleted(lesson.id);
                const isCurrent = currentLesson?.id === lesson.id;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-[#94C705]/10 border-2 border-[#94C705]'
                        : 'bg-[#0F0F0F] border-2 border-transparent hover:border-[#252525]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {completed ? (
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={20} className="text-[#666666] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium mb-1 ${isCurrent ? 'text-white' : 'text-[#999999]'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-sm text-[#666666]">{lesson.duration} min</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-16 bg-[#161616] border-2 border-[#252525] rounded-3xl">
              <FileText size={48} className="mx-auto mb-4 text-[#666666]" />
              <h3 className="text-xl font-bold text-white mb-2">No assignments yet</h3>
              <p className="text-[#999999]">Your instructor hasn't added any assignments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl hover:border-[#94C705]/30 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
                  <p className="text-[#999999] mb-4">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#666666] mb-4">
                    <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Max Score: {assignment.max_score}</span>
                  </div>
                  {assignment.instructions && (
                    <div className="mb-4 p-4 bg-[#0F0F0F] rounded-lg">
                      <p className="text-sm text-[#999999]">{assignment.instructions}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
                    variant="primary"
                    fullWidth
                  >
                    {assignment.has_submitted ? 'Resubmit Assignment' : 'Submit Assignment'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-16 bg-[#161616] border-2 border-[#252525] rounded-3xl">
              <Brain size={48} className="mx-auto mb-4 text-[#666666]" />
              <h3 className="text-xl font-bold text-white mb-2">No quizzes yet</h3>
              <p className="text-[#999999]">Your instructor hasn't added any quizzes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-6 bg-[#161616] border-2 border-[#252525] rounded-2xl hover:border-[#94C705]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                    {quiz.has_completed && (
                      <span className="px-3 py-1 bg-[#94C705]/10 text-[#94C705] text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-[#999999] mb-4">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#666666] mb-4">
                    <span>{quiz.duration} minutes</span>
                    <span>•</span>
                    <span>Passing: {quiz.passing_score}%</span>
                    <span>•</span>
                    <span>{quiz.max_attempts} attempts</span>
                  </div>
                  <Button
                    onClick={() => navigate(`/student/quizzes/${quiz.id}/take`)}
                    variant="primary"
                    fullWidth
                  >
                    {quiz.has_completed ? 'Retake Quiz' : 'Take Quiz'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseLearning;
