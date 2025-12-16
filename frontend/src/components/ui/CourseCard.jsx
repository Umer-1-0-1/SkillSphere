import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, truncateText } from '../../lib/utils';

export const CourseCard = ({ course, showStatus = false }) => {
  const linkPath = showStatus 
    ? `/instructor/edit-course/${course.id}`
    : `/courses/${course.id}`;
  
  return (
    <Link to={linkPath}>
      <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-6 hover:border-[#94C705] transition-all cursor-pointer h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-48 mb-4 rounded-2xl overflow-hidden bg-[var(--muted)]">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[var(--text-secondary)]">No image</span>
            </div>
          )}
          
          {/* Free badge */}
          {course.is_free && (
            <div className="absolute top-3 right-3 bg-[var(--primary)] text-black px-3 py-1 rounded-full text-xs font-bold">
              FREE
            </div>
          )}
          
          {/* Status badge for instructor view */}
          {showStatus && (
            <div className={`absolute top-3 left-3 status-badge status-${course.status?.toLowerCase()}`}>
              {course.status}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-white line-clamp-2" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
            {course.title}
          </h3>
          
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>
            {truncateText(course.description, 100)}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-[var(--text-secondary)]">
              {course.instructor_name || course.instructor?.full_name}
            </span>
            {!course.is_free && (
              <span className="text-lg font-bold text-[var(--primary)]">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
          
          {course.lesson_count !== undefined && (
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-2">
              <span>{course.lesson_count} lessons</span>
              {course.total_duration && (
                <span>{Math.floor(course.total_duration / 60)}h total</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
