import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import {
  togglePostLike, deletePost, addComment,
  toggleCommentLike, addReply, toggleReplyLike,
  getPostLikes, getCommentLikes, getReplyLikes,
} from '../../api/posts';
import type { Post, Comment, Reply } from '../../types/index';

interface Props {
  post: Post;
  onPostDeleted: (postId: string) => void;
  onPostUpdated: (post: Post) => void;
}

const PostCard = ({ post, onPostDeleted, onPostUpdated }: Props) => {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});
  const [likesModal, setLikesModal] = useState<{ show: boolean; users: { id: string; firstName: string; lastName: string }[] }>({ show: false, users: [] });

  const isLiked = post.likes.some((l) => l.userId === user?.id);
  const isAuthor = post.author.id === user?.id;

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0]}${lastName[0]}`.toUpperCase();

  const formatDate = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleLike = async () => {
    try {
      const res = await togglePostLike(post.id);
      const updatedPost = {
        ...post,
        likes: res.liked
          ? [...post.likes, { userId: user!.id }]
          : post.likes.filter((l) => l.userId !== user!.id),
      };
      onPostUpdated(updatedPost);
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      onPostDeleted(post.id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await addComment(post.id, commentText);
      const updatedPost = {
        ...post,
        comments: [...post.comments, res.comment],
      };
      onPostUpdated(updatedPost);
      setCommentText('');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleCommentLike = async (comment: Comment) => {
    try {
      const res = await toggleCommentLike(comment.id);
      const updatedComments = post.comments.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              likes: res.liked
                ? [...c.likes, { userId: user!.id }]
                : c.likes.filter((l) => l.userId !== user!.id),
            }
          : c
      );
      onPostUpdated({ ...post, comments: updatedComments });
    } catch {
      toast.error('Failed to like comment');
    }
  };

  const handleAddReply = async (commentId: string) => {
    const text = replyTexts[commentId];
    if (!text?.trim()) return;
    try {
      const res = await addReply(commentId, text);
      const updatedComments = post.comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, res.reply] } : c
      );
      onPostUpdated({ ...post, comments: updatedComments });
      setReplyTexts((prev) => ({ ...prev, [commentId]: '' }));
      setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));
    } catch {
      toast.error('Failed to add reply');
    }
  };

  const handleReplyLike = async (commentId: string, reply: Reply) => {
    try {
      const res = await toggleReplyLike(reply.id);
      const updatedComments = post.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === reply.id
                  ? {
                      ...r,
                      likes: res.liked
                        ? [...r.likes, { userId: user!.id }]
                        : r.likes.filter((l) => l.userId !== user!.id),
                    }
                  : r
              ),
            }
          : c
      );
      onPostUpdated({ ...post, comments: updatedComments });
    } catch {
      toast.error('Failed to like reply');
    }
  };

  const handleShowPostLikes = async () => {
    try {
      const res = await getPostLikes(post.id);
      setLikesModal({ show: true, users: res.likes.map((l: { user: { id: string; firstName: string; lastName: string } }) => l.user) });
    } catch {
      toast.error('Failed to load likes');
    }
  };

  const handleShowCommentLikes = async (commentId: string) => {
    try {
      const res = await getCommentLikes(commentId);
      setLikesModal({ show: true, users: res.likes.map((l: { user: { id: string; firstName: string; lastName: string } }) => l.user) });
    } catch {
      toast.error('Failed to load likes');
    }
  };

  const handleShowReplyLikes = async (replyId: string) => {
    try {
      const res = await getReplyLikes(replyId);
      setLikesModal({ show: true, users: res.likes.map((l: { user: { id: string; firstName: string; lastName: string } }) => l.user) });
    } catch {
      toast.error('Failed to load likes');
    }
  };

  return (
    <>
      <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
        {/* Post Header */}
        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <div className="_feed_inner_timeline_post_top">
            <div className="_feed_inner_timeline_post_box">
              <div className="_feed_inner_timeline_post_box_image">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt="" className="_post_img" />
                ) : (
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'var(--color5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 600, fontSize: '14px',
                  }}>
                    {getInitials(post.author.firstName, post.author.lastName)}
                  </div>
                )}
              </div>
              <div className="_feed_inner_timeline_post_box_txt">
                <h4 className="_feed_inner_timeline_post_box_title">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                <p className="_feed_inner_timeline_post_box_para">
                  {formatDate(post.createdAt)} · {post.visibility === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                </p>
              </div>
            </div>
            {isAuthor && (
              <button
                onClick={handleDelete}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color7)' }}
                title="Delete post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path stroke="#f00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Post Content */}
          <p style={{ fontSize: '14px', color: 'var(--color6)', marginBottom: '16px', lineHeight: '1.6' }}>
            {post.content}
          </p>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="_feed_inner_timeline_image">
              <img src={post.imageUrl} alt="Post" className="_time_img" style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }} />
            </div>
          )}
        </div>

        {/* Likes Count */}
        <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
          <div
            className="_feed_inner_timeline_total_reacts_image"
            onClick={handleShowPostLikes}
            style={{ cursor: 'pointer' }}
          >
            {post.likes.length > 0 && (
              <>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--color5)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px',
                }}>
                  👍
                </div>
                <p className="_feed_inner_timeline_total_reacts_para">{post.likes.length}</p>
              </>
            )}
          </div>
          <div className="_feed_inner_timeline_total_reacts_txt">
            <p className="_feed_inner_timeline_total_reacts_para1">
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => setShowComments(!showComments)}
              >
                <span>{post.comments.length}</span> Comment{post.comments.length !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
        </div>

        {/* Reaction Buttons */}
        <div className="_feed_inner_timeline_reaction">
          <button
            className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${isLiked ? '_feed_reaction_active' : ''}`}
            onClick={handleLike}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                {isLiked ? '👍 Liked' : '👍 Like'}
              </span>
            </span>
          </button>
          <button
            className="_feed_inner_timeline_reaction_comment _feed_reaction"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span>💬 Comment</span>
            </span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="_feed_inner_timeline_cooment_area">
            {/* Add Comment Input */}
            <div className="_feed_inner_comment_box _mar_b16">
              <div className="_feed_inner_comment_box_form">
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  <button
                    className="_feed_inner_comment_box_icon_btn"
                    onClick={handleAddComment}
                    style={{ background: 'var(--color5)', borderRadius: '6px', padding: '4px 10px', color: '#fff' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="_timline_comment_main">
              {post.comments.map((comment: Comment) => (
                <div key={comment.id} className="_comment_main _mar_b16">
                  <div className="_comment_image">
                    {comment.author.avatar ? (
                      <img src={comment.author.avatar} alt="" className="_comment_img1" />
                    ) : (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--color8)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 600, fontSize: '12px',
                      }}>
                        {getInitials(comment.author.firstName, comment.author.lastName)}
                      </div>
                    )}
                  </div>
                  <div className="_comment_area">
                    <div className="_comment_details">
                      <div className="_comment_name">
                        <h4 className="_comment_name_title">
                          {comment.author.firstName} {comment.author.lastName}
                        </h4>
                      </div>
                      <div className="_comment_status">
                        <p className="_comment_status_text">{comment.content}</p>
                      </div>

                      {/* Comment Reactions Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '13px' }}>
                        <span
                          style={{ cursor: 'pointer', color: comment.likes.some(l => l.userId === user?.id) ? 'var(--color5)' : 'var(--color7)', fontWeight: 500 }}
                          onClick={() => handleCommentLike(comment)}
                        >
                          👍 {comment.likes.length > 0 ? comment.likes.length : ''} Like
                        </span>
                        <span
                          style={{ cursor: 'pointer', color: 'var(--color7)', fontWeight: 500 }}
                          onClick={() => setShowReplyInput(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                        >
                          Reply
                        </span>
                        {comment.likes.length > 0 && (
                          <span
                            style={{ cursor: 'pointer', color: 'var(--color5)', fontSize: '12px' }}
                            onClick={() => handleShowCommentLikes(comment.id)}
                          >
                            See who liked
                          </span>
                        )}
                        <span style={{ color: 'var(--color7)', fontSize: '12px' }}>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Reply Input */}
                    {showReplyInput[comment.id] && (
                      <div className="_feed_inner_comment_box _mar_t8">
                        <div className="_feed_inner_comment_box_form">
                          <div className="_feed_inner_comment_box_content">
                            <div className="_feed_inner_comment_box_content_txt">
                              <textarea
                                className="form-control _comment_textarea"
                                placeholder="Write a reply..."
                                value={replyTexts[comment.id] || ''}
                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddReply(comment.id);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="_feed_inner_comment_box_icon">
                            <button
                              className="_feed_inner_comment_box_icon_btn"
                              onClick={() => handleAddReply(comment.id)}
                              style={{ background: 'var(--color5)', borderRadius: '6px', padding: '4px 10px', color: '#fff' }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.map((reply: Reply) => (
                      <div key={reply.id} className="_comment_main _mar_t8" style={{ marginLeft: '20px' }}>
                        <div className="_comment_image">
                          {reply.author.avatar ? (
                            <img src={reply.author.avatar} alt="" className="_comment_img1" />
                          ) : (
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'var(--color5)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 600, fontSize: '11px',
                            }}>
                              {getInitials(reply.author.firstName, reply.author.lastName)}
                            </div>
                          )}
                        </div>
                        <div className="_comment_area">
                          <div className="_comment_details">
                            <div className="_comment_name">
                              <h4 className="_comment_name_title" style={{ fontSize: '13px' }}>
                                {reply.author.firstName} {reply.author.lastName}
                              </h4>
                            </div>
                            <div className="_comment_status">
                              <p className="_comment_status_text" style={{ fontSize: '13px' }}>{reply.content}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
                              <span
                                style={{ cursor: 'pointer', color: reply.likes.some(l => l.userId === user?.id) ? 'var(--color5)' : 'var(--color7)', fontWeight: 500 }}
                                onClick={() => handleReplyLike(comment.id, reply)}
                              >
                                👍 {reply.likes.length > 0 ? reply.likes.length : ''} Like
                              </span>
                              {reply.likes.length > 0 && (
                                <span
                                  style={{ cursor: 'pointer', color: 'var(--color5)', fontSize: '11px' }}
                                  onClick={() => handleShowReplyLikes(reply.id)}
                                >
                                  See who liked
                                </span>
                              )}
                              <span style={{ color: 'var(--color7)' }}>
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Likes Modal */}
      {likesModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setLikesModal({ show: false, users: [] })}
        >
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '24px',
            minWidth: '300px', maxHeight: '400px', overflow: 'auto',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: '16px', color: 'var(--color6)' }}>Liked by</h5>
            {likesModal.users.length === 0 ? (
              <p style={{ color: 'var(--color7)' }}>No likes yet</p>
            ) : (
              likesModal.users.map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--color5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px',
                  }}>
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <span style={{ fontWeight: 500, color: 'var(--color6)' }}>
                    {u.firstName} {u.lastName}
                  </span>
                </div>
              ))
            )}
            <button
              onClick={() => setLikesModal({ show: false, users: [] })}
              style={{ marginTop: '16px', background: 'var(--color5)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;