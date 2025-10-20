import React, { useState, useEffect } from 'react';
import { makeRequest } from '../../axios';
import { useToast } from '../../components/GlobalToast'
import Loading from '../../components/Loading';
import SearchBox from '../../components/SearchBox';
import '../../components/SearchBox.css';
import './PostsManagement.scss';

export default function PostsManagement() {
  useEffect(() => {
    document.title = 'Quản lý Bài viết - SDU-JobQuest Admin'
  }, [])

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'career-guide',
    tags: [],
    tagsInput: '', // Thêm field để lưu input text
    status: 'draft',
    is_featured: false,
    meta_title: '',
    meta_description: ''
  });
  const [formError, setFormError] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const { success, error: toastError } = useToast();

  // Load danh sách posts
  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await makeRequest.get('/posts/admin/stats');
      const postsResponse = await makeRequest.get('/posts?limit=50');
      setPosts(postsResponse.data.data);
    } catch (error) {
      toastError('Lỗi khi tải danh sách bài viết');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts based on search term
  useEffect(() => {
    if (posts) {
      if (!searchTerm.trim()) {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter(post => 
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredPosts(filtered);
      }
    }
  }, [posts, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Xử lý form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Xử lý upload ảnh
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      toastError('Vui lòng chọn file ảnh');
      return;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

            const response = await makeRequest.post('/posts/upload/image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

      setFormData(prev => ({
        ...prev,
        featured_image: `http://localhost:8800${response.data.data.url}`
      }));
      
      success('Upload ảnh thành công');
    } catch (error) {
      toastError('Lỗi khi upload ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  // Xóa ảnh
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      featured_image: ''
    }));
  };

  const handleTagsChange = (e) => {
    const value = e.target.value || '';
    setFormData(prev => ({
      ...prev,
      tagsInput: value
    }));
  };

  const handleTagsBlur = () => {
    const tags = formData.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Tạo slug từ title
  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value || '';
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      meta_title: title
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!formData.title || !formData.title.trim()) errors.title = 'Tiêu đề không được để trống';
    if (!formData.slug || !formData.slug.trim()) errors.slug = 'Slug không được để trống';
    if (!formData.content || !formData.content.trim()) errors.content = 'Nội dung không được để trống';

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    try {
      if (editData) {
        // Update
        await makeRequest.put(`/posts/admin/${editData.id}`, formData);
        success('Cập nhật bài viết thành công');
      } else {
        // Create
        await makeRequest.post('/posts/admin', formData);
        success('Tạo bài viết thành công');
      }
      
      handleClose();
      loadPosts();
    } catch (error) {
      toastError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Xóa bài viết
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      await makeRequest.delete(`/posts/admin/${id}`);
      success('Xóa bài viết thành công');
      loadPosts();
    } catch (error) {
      toastError('Lỗi khi xóa bài viết');
    }
  };

  // Mở dialog edit
  const handleEdit = async (post) => {
    try {
      // Lấy dữ liệu đầy đủ từ API
      const response = await makeRequest.get(`/posts/admin/${post.id}`);
      const fullPostData = response.data.data;
      
      console.log('Full post data:', fullPostData); // Debug log
      setEditData(fullPostData);
      
      // Xử lý tags - có thể là JSON string hoặc array
      let tags = [];
      if (fullPostData.tags) {
        if (typeof fullPostData.tags === 'string') {
          try {
            tags = JSON.parse(fullPostData.tags);
          } catch (e) {
            // Nếu không parse được JSON, coi như là string đơn giản
            tags = fullPostData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } else if (Array.isArray(fullPostData.tags)) {
          tags = fullPostData.tags;
        }
      }
      
      setFormData({
        title: fullPostData.title || '',
        slug: fullPostData.slug || '',
        excerpt: fullPostData.excerpt || '',
        content: fullPostData.content || '',
        featured_image: fullPostData.featured_image ? 
          (fullPostData.featured_image.startsWith('http') ? 
            fullPostData.featured_image : 
            `http://localhost:8800${fullPostData.featured_image}`) : '',
        category: fullPostData.category || 'career-guide',
        tags: tags,
        tagsInput: tags.join(', '), // Khởi tạo tagsInput từ tags array
        status: fullPostData.status || 'draft',
        is_featured: fullPostData.is_featured || false,
        meta_title: fullPostData.meta_title || '',
        meta_description: fullPostData.meta_description || ''
      });
      setOpenDialog(true);
    } catch (error) {
      console.error('Error loading post details:', error);
      toastError('Lỗi khi tải dữ liệu bài viết');
    }
  };

  // Đóng dialog
  const handleClose = () => {
    setOpenDialog(false);
    setEditData(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      category: 'career-guide',
      tags: [],
      tagsInput: '', // Reset tagsInput
      status: 'draft',
      is_featured: false,
      meta_title: '',
      meta_description: ''
    });
    setFormError({});
  };

  // Mở dialog tạo mới
  const handleAdd = () => {
    setEditData(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      category: 'career-guide',
      tags: [],
      status: 'draft',
      is_featured: false,
      meta_title: '',
      meta_description: ''
    });
    setOpenDialog(true);
  };

  return (
    <div className="posts-management">
      <div className="posts-management__header">
        <h2>Quản lý bài viết</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i>
          Thêm bài viết
        </button>
      </div>

      <div className="posts-management__content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <SearchBox 
            placeholder="Tìm kiếm theo tiêu đề, mô tả, danh mục, tags..."
            onSearch={handleSearch}
            onClear={handleClearSearch}
            className="me-3"
          />
          <div className="text-muted small">
            Hiển thị {filteredPosts.length} / {posts?.length || 0} bài viết
          </div>
        </div>
        
        {loading ? (
          <Loading text="Đang tải bài viết..." />
        ) : (
          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ảnh</th>
                  <th>Lượt xem</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <div className="post-title">
                        {post.title}
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge category-${post.category}`}>
                        {post.category === 'career-guide' ? 'Cẩm nang' :
                         post.category === 'job-tips' ? 'Bí kíp tìm việc' :
                         post.category === 'industry-insights' ? 'Thông tin ngành' : post.category}
                      </span>
                    </td>
                    <td>
                      {post.featured_image ? (
                        <div className="post-image">
                          <img 
                            src={post.featured_image.startsWith('http') ? 
                              post.featured_image : 
                              `http://localhost:8800${post.featured_image}`} 
                            alt={post.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="no-image" style={{display: 'none'}}>
                            <i className="fa-solid fa-image"></i>
                          </div>
                        </div>
                      ) : (
                        <div className="no-image">
                          <i className="fa-solid fa-image"></i>
                        </div>
                      )}
                    </td>
                    <td>{post.view_count}</td>
                    <td>{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(post)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(post.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog tạo/sửa bài viết */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>{editData ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h3>
              <button className="btn-close" onClick={handleClose}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dialog-content">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className={formError.title ? 'error' : ''}
                  placeholder="Nhập tiêu đề bài viết..."
                />
                {formError.title && <span className="error-text">{formError.title}</span>}
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={formError.slug ? 'error' : ''}
                  placeholder="url-slug-tu-dong-tao"
                />
                {formError.slug && <span className="error-text">{formError.slug}</span>}
              </div>

              <div className="form-group">
                <label>Tóm tắt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                />
              </div>

              <div className="form-group">
                <label>Ảnh đại diện</label>
                <div className="image-upload">
                  {formData.featured_image ? (
                    <div className="image-preview">
                      <img src={formData.featured_image} alt="Preview" />
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={handleRemoveImage}
                      >
                        <i className="fa-solid fa-trash"></i> Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="upload-button">
                        {uploadingImage ? (
                          <div className="uploading">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Đang upload...
                          </div>
                        ) : (
                          <div>
                            <i className="fa-solid fa-cloud-upload-alt"></i>
                            <span>Chọn ảnh đại diện</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Nội dung *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="10"
                  className={formError.content ? 'error' : ''}
                  placeholder="Nhập nội dung chi tiết của bài viết..."
                />
                {formError.content && <span className="error-text">{formError.content}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="career-guide">Cẩm nang nghề nghiệp</option>
                    <option value="job-tips">Bí kíp tìm việc</option>
                    <option value="industry-insights">Thông tin ngành</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={handleTagsChange}
                  onBlur={handleTagsBlur}
                  placeholder="ví dụ: sales, nghề nghiệp, kỹ năng, IT, marketing"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                  />
                  Bài viết nổi bật
                </label>
                <small style={{display: 'block', marginTop: '5px', color: 'var(--cui-body-color-secondary)'}}>
                  Đánh dấu bài viết này là nổi bật để hiển thị ở vị trí ưu tiên
                </small>
              </div>

              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  placeholder="Tiêu đề SEO cho Google (tối đa 60 ký tự)"
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Mô tả SEO cho Google (tối đa 160 ký tự)"
                />
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editData ? 'Cập nhật' : 'Tạo bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

