import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CButton,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CImage
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilCopy } from '@coreui/icons';
import axios from 'axios';
import SearchBox from '../../components/SearchBox';
import '../../components/SearchBox.css';

const Pictures = () => {
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit'
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPictures, setFilteredPictures] = useState([]);
  
  // Copy dialog state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyData, setCopyData] = useState({
    width: 300,
    height: 200,
    copyType: 'link' // 'link' or 'html'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    file: null
  });

  useEffect(() => {
    document.title = 'Quản lý Hình ảnh - SDU-JobQuest Admin';
    fetchPictures();
  }, []);

  // Filter pictures based on search term
  useEffect(() => {
    if (pictures) {
      if (!searchTerm.trim()) {
        setFilteredPictures(pictures);
      } else {
        const filtered = pictures.filter(picture => 
          picture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          picture.filename?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPictures(filtered);
      }
    }
  }, [pictures, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const fetchPictures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pictures`, { withCredentials: true });
      setPictures(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách hình ảnh');
      console.error('Error fetching pictures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalType('add');
    setFormData({
      title: '',
      file: null
    });
    setSelectedPicture(null);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleEdit = (picture) => {
    setModalType('edit');
    setSelectedPicture(picture);
    setFormData({
      title: picture.title || '',
      file: null
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleCopy = (picture) => {
    setSelectedPicture(picture);
    setCopyData({
      width: 300,
      height: 200,
      copyType: 'link'
    });
    setShowCopyModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này?')) {
      try {
        setError(null);
        setSuccess(null);
        await axios.delete(`${import.meta.env.VITE_API_URL}/pictures/delete/${id}`, { withCredentials: true });
        setSuccess('Xóa hình ảnh thành công');
        setTimeout(() => setSuccess(null), 3000);
        fetchPictures();
      } catch (err) {
        setError('Không thể xóa hình ảnh');
        console.error('Error deleting picture:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      if (modalType === 'add') {
        await axios.post(`${import.meta.env.VITE_API_URL}/pictures/add`, submitData, { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        setSuccess('Thêm hình ảnh thành công');
        setTimeout(() => {
          setSuccess(null);
          setShowModal(false);
          fetchPictures();
        }, 2000);
      } else if (modalType === 'edit') {
        await axios.put(`${import.meta.env.VITE_API_URL}/pictures/update/${selectedPicture.id}`, submitData, { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        setSuccess('Cập nhật hình ảnh thành công');
        setTimeout(() => {
          setSuccess(null);
          setShowModal(false);
          fetchPictures();
        }, 2000);
      }
    } catch (err) {
      setError(modalType === 'add' ? 'Không thể thêm hình ảnh' : 'Không thể cập nhật hình ảnh');
      console.error('Error submitting form:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Đã copy vào clipboard');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể copy vào clipboard');
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleCopySubmit = () => {
    if (!selectedPicture) return;
    
    const imageUrl = selectedPicture.url || `${import.meta.env.VITE_API_URL}/images/posts/${selectedPicture.file_path}`;
    
    if (copyData.copyType === 'link') {
      copyToClipboard(imageUrl);
    } else {
      const htmlCode = `<img src="${imageUrl}" alt="${selectedPicture.title || 'Image'}" width="${copyData.width}" height="${copyData.height}" style="object-fit: cover;" />`;
      copyToClipboard(htmlCode);
    }
    
    setShowCopyModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPicture(null);
    setFormData({
      title: '',
      file: null
    });
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Quản lý Hình ảnh</h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm mới
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <SearchBox 
                placeholder="Tìm kiếm theo tên hình ảnh, tên file..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                className="me-3"
              />
              <div className="text-muted small">
                Hiển thị {filteredPictures.length} / {pictures?.length || 0} hình ảnh
              </div>
            </div>
            
            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Hình ảnh</CTableHeaderCell>
                  <CTableHeaderCell>Tên file</CTableHeaderCell>
                  <CTableHeaderCell>Kích thước</CTableHeaderCell>
                  <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                  <CTableHeaderCell>Thao tác</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredPictures.map((picture) => {
                  const imageUrl = picture.url || `${import.meta.env.VITE_API_URL}/images/posts/${picture.file_path}`;
                  return (
                    <CTableRow key={picture.id}>
                      <td>{picture.id}</td>
                      <td>
                        <CImage
                          src={imageUrl}
                          alt={picture.title}
                          width={50}
                          height={50}
                          className="rounded"
                          style={{ objectFit: 'cover' }}
                        />
                      </td>
                      <td>{picture.filename}</td>
                      <td>{(picture.size / 1024).toFixed(1)} KB</td>
                      <td>{new Date(picture.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <CButton
                          color="success"
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={() => handleCopy(picture)}
                        >
                          <CIcon icon={cilCopy} />
                        </CButton>
                        <CButton
                          color="warning"
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(picture)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(picture.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </td>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        {/* Modal */}
        <CModal visible={showModal} onClose={closeModal} size="lg">
          <CModalHeader>
            <CModalTitle>
              {modalType === 'add' && 'Thêm Hình ảnh'}
              {modalType === 'edit' && 'Sửa Hình ảnh'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            {error && (
              <CAlert color="danger" onClose={() => setError(null)} dismissible className="mb-3">
                {error}
              </CAlert>
            )}
            {success && (
              <CAlert color="success" onClose={() => setSuccess(null)} dismissible className="mb-3">
                {success}
              </CAlert>
            )}
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormInput
                    type="text"
                    label="Tên hình ảnh"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Logo công ty ABC"
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormInput
                    type="file"
                    label="Tải lên file hình ảnh"
                    name="file"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>
              Đóng
            </CButton>
            <CButton color="primary" onClick={handleSubmit}>
              {modalType === 'add' ? 'Thêm' : 'Cập nhật'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Copy Modal */}
        <CModal visible={showCopyModal} onClose={() => setShowCopyModal(false)} size="md">
          <CModalHeader>
            <CModalTitle>Copy Hình ảnh</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {error && (
              <CAlert color="danger" onClose={() => setError(null)} dismissible className="mb-3">
                {error}
              </CAlert>
            )}
            {success && (
              <CAlert color="success" onClose={() => setSuccess(null)} dismissible className="mb-3">
                {success}
              </CAlert>
            )}
            {selectedPicture && (
              <>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <label className="form-label">Hình ảnh:</label>
                    <div className="text-center">
                      <CImage
                        src={selectedPicture.url || `${import.meta.env.VITE_API_URL}/images/posts/${selectedPicture.file_path}`}
                        alt={selectedPicture.title}
                        className="rounded"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Chiều rộng (px)"
                      value={copyData.width}
                      onChange={(e) => setCopyData(prev => ({ ...prev, width: parseInt(e.target.value) || 300 }))}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Chiều cao (px)"
                      value={copyData.height}
                      onChange={(e) => setCopyData(prev => ({ ...prev, height: parseInt(e.target.value) || 200 }))}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormSelect
                      label="Loại copy"
                      value={copyData.copyType}
                      onChange={(e) => setCopyData(prev => ({ ...prev, copyType: e.target.value }))}
                    >
                      <option value="link">Copy Link hình ảnh</option>
                      <option value="html">Copy HTML với kích thước</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
              </>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowCopyModal(false)}>
              Đóng
            </CButton>
            <CButton color="success" onClick={handleCopySubmit}>
              <CIcon icon={cilCopy} className="me-2" />
              Copy
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  );
};

export default Pictures;
