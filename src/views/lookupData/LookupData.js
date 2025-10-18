import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CAlert,
  CSpinner,
  CBadge
} from '@coreui/react';
import { cilPlus, cilPencil, cilTrash, cilInfo } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import axios from 'axios';
import SearchBox from '../../components/SearchBox';
import '../../components/SearchBox.css';

const LookupData = () => {
  const [lookupData, setLookupData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLookupData, setFilteredLookupData] = useState({});
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    category: '',
    item_id: '',
    name: '',
    value: '',
    label: '',
    link: '',
    icon: '',
    text: ''
  });

  // Mapping category names to Vietnamese
  const categoryLabels = {
    educationJob: 'Trình độ học vấn',
    experienceJob: 'Kinh nghiệm làm việc',
    typeWorkJob: 'Loại hình công việc',
    salaryJob: 'Mức lương',
    locationJob: 'Địa điểm làm việc',
    companySize: 'Quy mô công ty',
    jobLevel: 'Cấp bậc công việc',
    skillCategory: 'Danh mục kỹ năng',
    industryType: 'Loại ngành nghề',
    workMode: 'Chế độ làm việc',
    scale: 'Quy mô công ty',
    statusCompany: 'Trạng thái CV của công ty',
    statusUser: 'Trạng thái CV của user',
    typeWorks: 'Loại công việc',
    sexData: 'Giới tính'
  };

  useEffect(() => {
    document.title = 'Quản lý Lookup Data - SDU-JobQuest Admin';
    fetchLookupData();
  }, []);

  // Filter lookup data based on search term
  useEffect(() => {
    if (lookupData && Object.keys(lookupData).length > 0) {
      if (!searchTerm.trim()) {
        setFilteredLookupData(lookupData);
      } else {
        const filtered = {};
        Object.keys(lookupData).forEach(category => {
          const filteredItems = lookupData[category].filter(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (filteredItems.length > 0) {
            filtered[category] = filteredItems;
          }
        });
        setFilteredLookupData(filtered);
      }
    }
  }, [lookupData, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const fetchLookupData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/lookup-data/all`, { withCredentials: true });
      setLookupData(response.data.data);
      
      // Extract unique categories
      const cats = Object.keys(response.data.data);
      setCategories(cats);
    } catch (err) {
      setError('Không thể tải dữ liệu lookup data');
      console.error('Error fetching lookup data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalType('add');
    setFormData({
      category: '',
      item_id: '',
      name: '',
      value: '',
      label: '',
      link: '',
      icon: '',
      text: ''
    });
    setSelectedItem(null);
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setFormData({
      category: item.category,
      item_id: item.item_id,
      name: item.name,
      value: item.value || '',
      label: item.label || '',
      link: item.link || '',
      icon: item.icon || '',
      text: item.text || ''
    });
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages
    setShowModal(true);
  };

  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setFormData({
      category: item.category,
      item_id: item.item_id,
      name: item.name,
      value: item.value || '',
      label: item.label || '',
      link: item.link || '',
      icon: item.icon || '',
      text: item.text || ''
    });
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa item này?')) {
      try {
        setError(null); // Clear previous errors
        setSuccess(null); // Clear previous success messages
        await axios.delete(`${import.meta.env.VITE_API_URL}/lookup-data/delete/${id}`, { withCredentials: true });
        setSuccess('Xóa item thành công');
        // Auto hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        fetchLookupData();
      } catch (err) {
        setError('Không thể xóa item');
        console.error('Error deleting item:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null); // Clear previous errors
      setSuccess(null); // Clear previous success messages
      
      if (modalType === 'add') {
        await axios.post(`${import.meta.env.VITE_API_URL}/lookup-data/add`, formData, { withCredentials: true });
        setSuccess('Thêm item thành công');
        // Auto hide success message and close modal after 2 seconds
        setTimeout(() => {
          setSuccess(null);
          setShowModal(false);
          fetchLookupData();
        }, 2000);
      } else if (modalType === 'edit') {
        await axios.put(`${import.meta.env.VITE_API_URL}/lookup-data/update/${selectedItem.id}`, formData, { withCredentials: true });
        setSuccess('Cập nhật item thành công');
        // Auto hide success message and close modal after 2 seconds
        setTimeout(() => {
          setSuccess(null);
          setShowModal(false);
          fetchLookupData();
        }, 2000);
      }
    } catch (err) {
      setError(modalType === 'add' ? 'Không thể thêm item' : 'Không thể cập nhật item');
      console.error('Error submitting form:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      category: '',
      item_id: '',
      name: '',
      value: '',
      label: '',
      link: '',
      icon: '',
      text: ''
    });
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages
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
              <h4 className="mb-0">Quản lý Lookup Data</h4>
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm mới
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <SearchBox 
                placeholder="Tìm kiếm theo tên, giá trị, label, category..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                className="me-3"
              />
              <div className="text-muted small">
                Hiển thị {Object.keys(filteredLookupData).length} / {Object.keys(lookupData).length} categories
              </div>
            </div>
            
            {Object.keys(filteredLookupData).map(category => (
                <div key={category} className="mb-4">
                  <h5 className="mb-3">
                    <CBadge color="info" className="me-2">
                      <strong>{categoryLabels[category] || category}</strong> - {category}
                    </CBadge>
                    ({filteredLookupData[category]?.length || 0} items)
                  </h5>
                <CTable responsive hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Item ID</CTableHeaderCell>
                      <CTableHeaderCell>Tên</CTableHeaderCell>
                      <CTableHeaderCell>Giá trị</CTableHeaderCell>
                      <CTableHeaderCell>Label</CTableHeaderCell>
                      <CTableHeaderCell>Link</CTableHeaderCell>
                      <CTableHeaderCell>Icon</CTableHeaderCell>
                      <CTableHeaderCell>Thao tác</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredLookupData[category]?.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell>{item.id}</CTableDataCell>
                        <CTableDataCell>{item.item_id}</CTableDataCell>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>{item.value || '-'}</CTableDataCell>
                        <CTableDataCell>{item.label || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {item.link ? (
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              Link
                            </a>
                          ) : '-'}
                        </CTableDataCell>
                        <CTableDataCell>{item.icon || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleView(item)}
                          >
                            <CIcon icon={cilInfo} />
                          </CButton>
                          <CButton
                            color="warning"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(item)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            ))}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal */}
      <CModal visible={showModal} onClose={closeModal} size="lg">
        <CModalHeader onClose={closeModal}>
          <CModalTitle>
            {modalType === 'add' && 'Thêm Lookup Data'}
            {modalType === 'edit' && 'Sửa Lookup Data'}
            {modalType === 'view' && 'Xem Lookup Data'}
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
              <CCol md={6}>
                <CFormSelect
                  label="Category *"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={modalType === 'view'}
                >
                  <option value="">Chọn category...</option>
                  <option value="educationJob"><strong>Trình độ học vấn</strong> - educationJob</option>
                  <option value="experienceJob"><strong>Kinh nghiệm làm việc</strong> - experienceJob</option>
                  <option value="typeWorkJob"><strong>Loại hình công việc</strong> - typeWorkJob</option>
                  <option value="salaryJob"><strong>Mức lương</strong> - salaryJob</option>
                  <option value="locationJob"><strong>Địa điểm làm việc</strong> - locationJob</option>
                  <option value="companySize"><strong>Quy mô công ty</strong> - companySize</option>
                  <option value="jobLevel"><strong>Cấp bậc công việc</strong> - jobLevel</option>
                  <option value="skillCategory"><strong>Danh mục kỹ năng</strong> - skillCategory</option>
                  <option value="industryType"><strong>Loại ngành nghề</strong> - industryType</option>
                  <option value="workMode"><strong>Chế độ làm việc</strong> - workMode</option>
                  <option value="scale"><strong>Quy mô công ty</strong> - scale</option>
                  <option value="statusCompany"><strong>Trạng thái CV của công ty</strong> - statusCompany</option>
                  <option value="statusUser"><strong>Trạng thái CV của user</strong> - statusUser</option>
                  <option value="typeWorks"><strong>Loại công việc</strong> - typeWorks</option>
                  <option value="sexData"><strong>Giới tính</strong> - sexData</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Item ID *"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 1, 2, 3 hoặc bachelor, master"
                  required
                  disabled={modalType === 'view'}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormInput
                  type="text"
                  label="Tên *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Cử nhân, Thạc sĩ, Tiến sĩ"
                  required
                  disabled={modalType === 'view'}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Giá trị"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: bachelor, master, phd"
                  disabled={modalType === 'view'}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Cử nhân, Thạc sĩ, Tiến sĩ"
                  disabled={modalType === 'view'}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  type="url"
                  label="Link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: https://example.com"
                  disabled={modalType === 'view'}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: fa-graduation-cap, fa-briefcase"
                  disabled={modalType === 'view'}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormTextarea
                  label="Text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Ví dụ: Mô tả chi tiết về trình độ học vấn hoặc kinh nghiệm làm việc..."
                  disabled={modalType === 'view'}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Đóng
          </CButton>
          {modalType !== 'view' && (
            <CButton color="primary" onClick={handleSubmit}>
              {modalType === 'add' ? 'Thêm' : 'Cập nhật'}
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default LookupData;











