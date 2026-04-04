import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../api/posts';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import type { Post } from '../types/index';

const FeedPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.content.toLowerCase().includes(q) ||
            p.author.firstName.toLowerCase().includes(q) ||
            p.author.lastName.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, posts]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getPosts();
      setPosts(data.posts);
      setFilteredPosts(data.posts);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">

        {/* ===== NAVBAR ===== */}
        <nav className="navbar navbar-expand-lg _header_nav" style={{ padding: '0 0 0 0' }}>
          <div className="container-fluid px-4">

            {/* Logo */}
            <a className="navbar-brand" href="/feed">
              <img src="/assets/images/logo.svg" alt="BuddyScript" style={{ maxWidth: '160px' }} />
            </a>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px', position: 'relative' }}>
              <svg
                style={{ position: 'absolute', top: '11px', left: '14px' }}
                xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17"
              >
                <circle cx="7" cy="7" r="6" stroke="#666"/>
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"/>
              </svg>
              <input
                className="form-control _inpt1"
                type="search"
                placeholder="Search posts or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%', borderRadius: '32px' }}
              />
            </div>

            {/* Right side — profile + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--color5)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 600, fontSize: '13px',
                  flexShrink: 0,
                }}>
                  {getInitials()}
                </div>
              )}
              <span style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color6)', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  border: '1px solid var(--color5)', background: 'transparent',
                  borderRadius: '6px', padding: '6px 16px',
                  color: 'var(--color5)', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                Logout
              </button>
            </div>

          </div>
        </nav>

        {/* ===== MAIN LAYOUT ===== */}
        <div className="container" style={{ maxWidth: '1320px', paddingTop: '80px' }}>
          <div className="row">

            {/* Left Sidebar */}
            <div className="col-xl-3 col-lg-3 d-none d-lg-block">
              <div className="_layout_left_sidebar_wrap">
                <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                  <h4 className="_title5 _mar_b24">Explore</h4>
                  <ul className="_left_inner_area_explore_list">
                    {[
                      { label: 'Learning', icon: '🎓' },
                      { label: 'Insights', icon: '📊' },
                      { label: 'Find Friends', icon: '👥' },
                      { label: 'Bookmarks', icon: '🔖' },
                      { label: 'Groups', icon: '👨‍👩‍👧' },
                      { label: 'Gaming', icon: '🎮' },
                      { label: 'Settings', icon: '⚙️' },
                    ].map((item) => (
                      <li key={item.label} className="_left_inner_area_explore_item">
                        <a href="#0" className="_left_inner_area_explore_link">
                          <span style={{ marginRight: '10px' }}>{item.icon}</span>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Middle Feed */}
            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="_layout_middle_wrap">
                <div className="_layout_middle_inner">

                  {/* Create Post */}
                  <CreatePost onPostCreated={handlePostCreated} />

                  {/* Search Results Label */}
                  {searchQuery && (
                    <div style={{
                      padding: '8px 16px', marginBottom: '8px',
                      fontSize: '14px', color: 'var(--color7)',
                    }}>
                      {filteredPosts.length > 0
                        ? `Found ${filteredPosts.length} result${filteredPosts.length > 1 ? 's' : ''} for "${searchQuery}"`
                        : `No results for "${searchQuery}"`}
                    </div>
                  )}

                  {/* Posts */}
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color7)' }}>
                      <div className="spinner-border text-primary" role="status" />
                      <p style={{ marginTop: '12px' }}>Loading posts...</p>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '40px',
                      background: '#fff', borderRadius: '6px',
                      color: 'var(--color7)',
                    }}>
                      {searchQuery ? '🔍 No posts found' : 'No posts yet. Be the first to post! 🚀'}
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostUpdated}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-xl-3 col-lg-3 d-none d-lg-block">
              <div className="_layout_right_sidebar_wrap">
                <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                  <h4 className="_title5 _mar_b16">Your Profile</h4>
                  <hr />
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'var(--color5)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '28px',
                      margin: '0 auto 12px',
                    }}>
                      {getInitials()}
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--color6)', marginBottom: '4px' }}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color7)' }}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;