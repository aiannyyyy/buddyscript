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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getPosts();
      setPosts(data.posts);
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
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/assets/images/logo.svg" alt="Logo" className="_nav_logo" />
              </a>
            </div>
            <div className="collapse navbar-collapse">
              <div className="_header_form ms-auto">
                <form className="_header_form_grp">
                  <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                    <circle cx="7" cy="7" r="6" stroke="#666"/>
                    <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"/>
                  </svg>
                  <input className="form-control me-2 _inpt1" type="search" placeholder="Search..." />
                </form>
              </div>
              <div className="_header_nav_profile ms-auto">
                <div className="_header_nav_profile_image">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="_nav_profile_img" />
                  ) : (
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'var(--color5)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 600, fontSize: '12px',
                    }}>
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="_header_nav_dropdown">
                  <p className="_header_nav_para">{user?.firstName} {user?.lastName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    marginLeft: '16px', border: '1px solid var(--color5)',
                    background: 'transparent', borderRadius: '6px',
                    padding: '6px 14px', color: 'var(--color5)',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        {['Learning', 'Insights', 'Find friends', 'Bookmarks', 'Groups', 'Gaming', 'Settings'].map((item) => (
                          <li key={item} className="_left_inner_area_explore_item">
                            <a href="#0" className="_left_inner_area_explore_link">{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <CreatePost onPostCreated={handlePostCreated} />
                    {isLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color7)' }}>
                        Loading posts...
                      </div>
                    ) : posts.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: '40px',
                        background: '#fff', borderRadius: '6px', color: 'var(--color7)',
                      }}>
                        No posts yet. Be the first to post! 🚀
                      </div>
                    ) : (
                      posts.map((post) => (
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
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_right_inner_area_info_content _mar_b24">
                        <h4 className="_right_inner_area_info_content_title _title5">
                          Welcome, {user?.firstName}! 👋
                        </h4>
                      </div>
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
                        <p style={{ fontWeight: 600, color: 'var(--color6)' }}>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--color7)' }}>{user?.email}</p>
                      </div>
                    </div>
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