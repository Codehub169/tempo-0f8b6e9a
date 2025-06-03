import React from 'react';
import { Star, UserCircle, CalendarDays, MessageSquare } from 'lucide-react';

// Assumed UserReview type, should match what API returns from ReviewForm
export interface UserReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string; // ISO date string
  user: {
    id: string;
    name: string | null;
  };
}

interface ReviewListProps {
  reviews: UserReview[];
  isLoading?: boolean;
  error?: string | null;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading, error }) => {
  // Helper to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  // Empty state
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Reviews Yet</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Be the first to share your thoughts on this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <article key={review.id} className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-3 justify-between">
            <div className="flex items-center space-x-3">
                <UserCircle className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                <div>
                    <p className="text-md font-semibold text-gray-800 dark:text-white">{review.user.name || 'Anonymous User'}</p>
                    {renderStars(review.rating)}
                </div>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <CalendarDays className="w-4 h-4 mr-1" />
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1.5">{review.title}</h4>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
        </article>
      ))}
    </div>
  );
};

// Placeholder Loader2 icon if not imported already
const Loader2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default ReviewList;
