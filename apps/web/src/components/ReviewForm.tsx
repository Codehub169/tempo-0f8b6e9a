import React, { useState } from 'react';
import { Star, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

// Assumed UserReview type, should match what API returns and ReviewList expects
export interface UserReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (newReview: UserReview) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!title.trim() || !comment.trim()) {
      setError('Please provide a title and a comment.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newReview = await apiClient.submitReview(productId, { rating, title, comment });
      onReviewSubmitted(newReview);
      setSuccess('Review submitted successfully!');
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Write a Review</h3>
      
      {/* Rating Input */} 
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating*</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors duration-150 ease-in-out 
                          ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500 hover:text-yellow-300'}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>

      {/* Title Input */} 
      <div>
        <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Review Title*</label>
        <input
          id="reviewTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Excellent Product!"
          className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-shadow duration-150 focus:shadow-md"
          required
        />
      </div>

      {/* Comment Input */} 
      <div>
        <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Review*</label>
        <textarea
          id="reviewComment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Tell us more about your experience..."
          className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-shadow duration-150 focus:shadow-md"
          required
        />
      </div>

      {/* Messages */} 
      {error && (
        <div className="flex items-center p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md text-red-600 dark:text-red-200">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md text-green-600 dark:text-green-200">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Submit Button */} 
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-primary flex items-center justify-center group"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Send className="w-5 h-5 mr-2 transform transition-transform duration-300 group-hover:translate-x-1" />
        )}
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
