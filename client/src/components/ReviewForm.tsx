import React, { useState } from 'react';
import { HiOutlineStar } from 'react-icons/hi';
import { reviewApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReviewFormProps {
    productId: string;
    onReviewAdded: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewAdded }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-muted mb-4">Please log in to write a review.</p>
                <button
                    onClick={() => window.location.href = '/auth?redirect=' + window.location.pathname}
                    className="px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold active:scale-95 transition"
                >
                    Log In
                </button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.length < 5) {
            toast.error('Review must be at least 5 characters');
            return;
        }
        setLoading(true);
        try {
            await reviewApi.create(productId, { rating, comment });
            toast.success('Review submitted successfully');
            setComment('');
            setRating(5);
            onReviewAdded();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className="transition-transform active:scale-90"
                        >
                            <HiOutlineStar
                                className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-surface-300 dark:text-surface-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Your Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-surface-800 border-none outline-none focus:ring-2 focus:ring-primary-500/50 transition resize-none text-sm"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition disabled:opacity-50"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
