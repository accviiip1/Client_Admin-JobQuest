import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormCheck, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormTextarea, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { useQuery } from '@tanstack/react-query'
import makeRequest from '../../../makeRequest'
import axios from 'axios'
import { useToast } from '../../../components/GlobalToast'
import AddOrEditDialog from './AddOrEditDialog'
import SearchBox from '../../../components/SearchBox'
import '../../../components/SearchBox.css'

const ApplyJob = () => {
  const { success, error: toastError } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredApplies, setFilteredApplies] = useState([])
  
  // Bulk actions state
  const [selectedItems, setSelectedItems] = useState([])
  const [showMailModal, setShowMailModal] = useState(false)
  const [mailData, setMailData] = useState({
    subject: '',
    content: ''
  })
  const [mailError, setMailError] = useState(null)
  const [mailSuccess, setMailSuccess] = useState(null)

  const formatDateDisplay = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return String(value)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const getApplies = async () => {
    const res = await makeRequest.get('/apply/admin?limit=200')
    return res.data?.data || []
  }

  const { isLoading, error, data, refetch } = useQuery({ queryKey: ['applies'], queryFn: getApplies })

  // Filter applies based on search term
  React.useEffect(() => {
    if (data) {
      if (!searchTerm.trim()) {
        setFilteredApplies(data);
      } else {
        const filtered = data.filter(apply => 
          apply.id?.toString().includes(searchTerm.toLowerCase()) ||
          apply.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apply.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apply.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apply.user_id?.toString().includes(searchTerm.toLowerCase()) ||
          apply.job_id?.toString().includes(searchTerm.toLowerCase())
        );
        setFilteredApplies(filtered);
      }
    }
  }, [data, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleAdd = () => { setEditData(null); setOpenDialog(true) }
  const handleEdit = (item) => { setEditData(item); setOpenDialog(true) }
  const handleClose = () => setOpenDialog(false)

  const handleSubmit = async (values) => {
    try {
      if (editData) {
        await axios.put(`${import.meta.env.VITE_API_URL}/apply/admin/update`, values, { withCredentials: true })
        success('Cập nhật apply thành công')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/apply/admin/insert`, values, { withCredentials: true })
        success('Thêm apply thành công')
      }
      setOpenDialog(false); refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Thao tác thất bại')
      console.error('Failed to add/update apply:', serverData || err.message)
      toastError(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá đơn apply này?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/apply/admin/delete/${id}`, { withCredentials: true })
      success('Xoá apply thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Xoá thất bại')
      console.error('Failed to delete apply:', serverData || err.message)
      toastError(msg)
    }
  }

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredApplies.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredApplies.map(item => item.id))
    }
  }

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleSendMail = () => {
    if (selectedItems.length === 0) {
      toastError('Vui lòng chọn ít nhất một ứng viên')
      return
    }
    setMailData({ subject: '', content: '' })
    setMailError(null)
    setMailSuccess(null)
    setShowMailModal(true)
  }

  const handleMailSubmit = async () => {
    if (!mailData.subject.trim() || !mailData.content.trim()) {
      setMailError('Vui lòng điền đầy đủ tiêu đề và nội dung email')
      return
    }

    try {
      setMailError(null)
      const emails = filteredApplies
        .filter(item => selectedItems.includes(item.id))
        .map(item => item.userEmail)
        .filter((email, index, self) => self.indexOf(email) === index) // Remove duplicates

      console.log('Sending email to:', emails)
      console.log('API URL:', import.meta.env.VITE_API_URL)
      console.log('Full URL:', `${import.meta.env.VITE_API_URL}/admin/send-bulk-email`)

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/send-bulk-email`, {
        emails,
        subject: mailData.subject,
        content: mailData.content
      }, { withCredentials: true })

      console.log('Email response:', response.data)

      setMailSuccess(`Đã gửi email thành công đến ${emails.length} ứng viên`)
      setShowMailModal(false)
      setSelectedItems([])
      setTimeout(() => setMailSuccess(null), 3000)
    } catch (err) {
      setMailError('Không thể gửi email. Vui lòng thử lại sau.')
      console.error('Error sending bulk email:', err)
      console.error('Error details:', err.response?.data)
    }
  }

  const handleDownloadCV = async () => {
    if (selectedItems.length === 0) {
      toastError('Vui lòng chọn ít nhất một ứng viên')
      return
    }

    try {
      const selectedApplies = filteredApplies.filter(item => selectedItems.includes(item.id))
      const cvUrls = selectedApplies.map(item => item.cv).filter(Boolean)
      
      if (cvUrls.length === 0) {
        toastError('Không có CV nào để tải xuống')
        return
      }

      // Download each CV
      for (let i = 0; i < cvUrls.length; i++) {
        const response = await fetch(cvUrls[i])
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CV_${selectedApplies[i].userEmail}_${i + 1}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      success(`Đã tải xuống ${cvUrls.length} CV`)
    } catch (err) {
      toastError('Không thể tải xuống CV')
      console.error('Error downloading CVs:', err)
    }
  }

  const handleHide = async () => {
    if (selectedItems.length === 0) {
      toastError('Vui lòng chọn ít nhất một ứng viên')
      return
    }

    if (!window.confirm(`Bạn có chắc chắn muốn ẩn ${selectedItems.length} ứng viên đã chọn?`)) {
      return
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/apply/admin/hide`, {
        ids: selectedItems
      }, { withCredentials: true })

      success(`Đã ẩn ${selectedItems.length} ứng viên`)
      setSelectedItems([])
      refetch()
    } catch (err) {
      toastError('Không thể ẩn ứng viên')
      console.error('Error hiding applicants:', err)
    }
  }

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {String(error.message || error)}</div>

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Apply Jobs</strong>
          <CButton type="button" color="success" size="sm" className="d-inline-flex align-items-center gap-2" onClick={handleAdd}>
            <CIcon icon={cilPlus} />
            <span>Add new</span>
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <SearchBox 
              placeholder="Tìm kiếm theo ID, email user, tên công việc..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              className="me-3"
            />
            <div className="text-muted small">
              Hiển thị {filteredApplies.length} / {data?.length || 0} ứng tuyển
            </div>
          </div>


          {mailSuccess && (
            <CAlert color="success" className="mb-3">
              {mailSuccess}
            </CAlert>
          )}
          <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
            <CTable striped hover bordered small align="middle" className="mb-0" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1500px' }}>
              <CTableCaption placement="top">Danh sách apply_job</CTableCaption>
              <CTableHead color="light" className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: 50 }}>
                    <CFormCheck 
                      checked={selectedItems.length === filteredApplies.length && filteredApplies.length > 0}
                      onChange={handleSelectAll}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: 160 }}>Actions</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 100 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>User Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>Job Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Phone</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 120 }}>Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 300 }}>Letter</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>CV</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Created</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Deleted</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredApplies?.length ? filteredApplies.map((item) => (
                  <CTableRow key={item.id} className="align-middle">
                    <CTableDataCell className="text-center">
                      <CFormCheck 
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <CButton size="sm" color="primary" variant="outline" onClick={() => handleEdit(item)} className="d-inline-flex align-items-center gap-1">
                          <CIcon icon={cilPencil} />
                          <span>Edit</span>
                        </CButton>
                        <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(item.id)} className="d-inline-flex align-items-center gap-1">
                          <CIcon icon={cilTrash} />
                          <span>Delete</span>
                        </CButton>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.id)}>{item.id}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.userEmail)}>{item.userEmail}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.jobName)}>{item.jobName}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.name}>{item.name}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.email}>{item.email}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.phone}>{item.phone}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.status)}>{item.status}</CTableDataCell>
                    <CTableDataCell className="text-truncate" style={{ maxWidth: 320 }} title={item.letter}><span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>{item.letter}</span></CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.cv}>{item.cv}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={formatDateDisplay(item.createdAt)}>{formatDateDisplay(item.createdAt)}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={formatDateDisplay(item.deletedAt)}>{formatDateDisplay(item.deletedAt)}</CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan={13} className="text-center">Không có dữ liệu</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
      <AddOrEditDialog
        open={openDialog}
        onClose={handleClose}
        currentItem={editData}
        onSubmit={handleSubmit}
      />

      {/* Send Mail Modal */}
      <CModal visible={showMailModal} onClose={() => setShowMailModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Gửi email hàng loạt</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {mailError && (
            <CAlert color="danger" className="mb-3">
              {mailError}
            </CAlert>
          )}
          
          <CForm>
            <div className="mb-3">
              <label className="form-label">Tiêu đề email</label>
              <CFormInput
                type="text"
                placeholder="Nhập tiêu đề email..."
                value={mailData.subject}
                onChange={(e) => setMailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Nội dung email</label>
              <CFormTextarea
                rows={8}
                placeholder="Nhập nội dung email..."
                value={mailData.content}
                onChange={(e) => setMailData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            
            <div className="alert alert-info">
              <strong>Sẽ gửi email đến {selectedItems.length} ứng viên đã chọn</strong>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowMailModal(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleMailSubmit}>
            Gửi email
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ApplyJob


