import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { createPost, uploadImage } from '../../api/posts';
import type { Post } from '../../types/index';

interface Props {
  onPostCreated: (post: Post) => void;
}

const CreatePost = ({ onPostCreated }: Props) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }
    try {
      setIsLoading(true);
      let imageUrl: string | undefined;

      if (imageFile) {
        setIsUploading(true);
        toast.info('Uploading image...');
        imageUrl = await uploadImage(imageFile);
        setIsUploading(false);
      }

      const data = await createPost({ content, visibility, imageUrl });
      onPostCreated(data.post);
      setContent('');
      setImageFile(null);
      setImagePreview('');
      toast.success('Post created!');
    } catch {
      toast.error('Failed to create post');
      setIsUploading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div style={{ marginRight: '12px', flexShrink: 0 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="_txt_img" />
          ) : (
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--color5)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              {getInitials()}
            </div>
          )}
        </div>
        <div className="_feed_inner_text_area_box_form w-100">
          <textarea
            className="form-control _textarea"
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              height: '88px', border: '1px solid var(--bg4)',
              borderRadius: '6px', padding: '12px',
            }}
          />
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{ position: 'relative', marginTop: '12px' }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }}
          />
          <button
            onClick={handleRemoveImage}
            style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', cursor: 'pointer',
              fontSize: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {/* Bottom Bar */}
      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">
          {/* Photo Upload Button */}
          <div className="_feed_common" onClick={() => fileInputRef.current?.click()}>
            <button type="button" className="_feed_inner_text_area_bottom_photo_link">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917z"/>
                </svg>
              </span>
              {imageFile ? '✅ Image Selected' : 'Photo'}
            </button>
          </div>

          {/* Visibility Selector */}
          <div className="_feed_common">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
              style={{
                border: '1px solid var(--bg4)', borderRadius: '6px',
                padding: '4px 8px', fontSize: '14px',
                background: 'transparent', color: 'var(--color7)', cursor: 'pointer',
              }}
            >
              <option value="PUBLIC">🌍 Public</option>
              <option value="PRIVATE">🔒 Private</option>
            </select>
          </div>
        </div>

        {/* Post Button */}
        <div className="_feed_inner_text_area_btn">
          <button
            type="button"
            className="_feed_inner_text_area_btn_link"
            onClick={handleSubmit}
            disabled={isLoading || isUploading}
          >
            <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
              <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd"/>
            </svg>
            <span>
              {isUploading ? 'Uploading...' : isLoading ? 'Posting...' : 'Post'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;