import React, { useState, useEffect } from 'react'
import { CAvatar, CBadge, CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CButtonGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCheck, cilX } from '@coreui/icons'
import { useQuery } from '@tanstack/react-query'
import makeRequest from '../../../makeRequest'
import axios from 'axios'
import { useToast } from '../../../components/GlobalToast'
import AddOrEditDialog from './AddOrEditDialog'
import SearchBox from '../../../components/SearchBox'
import '../../../components/SearchBox.css'
import './Jobs.css'

const Jobs = () => {
  useEffect(() => {
    document.title = 'Quản lý Việc làm - SDU-JobQuest Admin'
  }, [])
  const { success, error: toastError } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [formError, setFormError] = useState("")
  const [statusFilter, setStatusFilter] = useState('all') // all, 0, 1, 2
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredJobs, setFilteredJobs] = useState([])

  const getJobs = async () => {
    if (statusFilter === 'all') {
      const res = await makeRequest.get('/job?limit=100')
      return res.data?.data || []
    } else {
      const res = await makeRequest.get(`/job?status=${statusFilter}&limit=100`)
      return res.data?.data || []
    }
  }

  const { isLoading, error, data, refetch } = useQuery({ 
    queryKey: ['jobs', statusFilter], 
    queryFn: getJobs 
  })

  // Filter jobs based on search term
  useEffect(() => {
    if (data) {
      if (!searchTerm.trim()) {
        setFilteredJobs(data);
      } else {
        const filtered = data.filter(job => 
          job.id?.toString().includes(searchTerm.toLowerCase()) ||
          job.nameJob?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.request?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.other?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.idCompany?.toString().includes(searchTerm.toLowerCase()) ||
          job.idField?.toString().includes(searchTerm.toLowerCase()) ||
          job.idProvince?.toString().includes(searchTerm.toLowerCase()) ||
          job.salaryMin?.toString().includes(searchTerm.toLowerCase()) ||
          job.salaryMax?.toString().includes(searchTerm.toLowerCase()) ||
          job.sex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.typeWork?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.education?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.experience?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredJobs(filtered);
      }
    }
  }, [data, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleAdd = () => { 
    setEditData(null); 
    setFormError(""); // Xóa lỗi khi mở dialog
    setOpenDialog(true) 
  }
  const handleEdit = (item) => { 
    setEditData(item); 
    setFormError(""); // Xóa lỗi khi mở dialog
    setOpenDialog(true) 
  }
  const handleClose = () => {
    setOpenDialog(false);
    setFormError(""); // Xóa lỗi khi đóng dialog
  }

  const handleSubmit = async (values) => {
    try {
      if (editData) {
        await axios.put(`${import.meta.env.VITE_API_URL}/job/admin/update`, values, { withCredentials: true })
        success('Cập nhật job thành công')
        setOpenDialog(false); 
        refetch()
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/job/admin/insert`, values, { withCredentials: true })
        success('Thêm job thành công')
        setOpenDialog(false); 
        refetch()
      }
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Thao tác thất bại')
      console.error('Failed to add/update job:', serverData || err.message)
      // Hiển thị lỗi ở form thay vì toast
      setFormError(msg);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá job này?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/job/admin/delete/${id}`, { withCredentials: true })
      success('Xoá job thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Xoá thất bại')
      console.error('Failed to delete job:', serverData || err.message)
      toastError(msg)
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm('Duyệt job này?')) return
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/job/admin/approve/${id}`, {}, { withCredentials: true })
      success('Duyệt job thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Duyệt thất bại')
      console.error('Failed to approve job:', serverData || err.message)
      toastError(msg)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Từ chối job này?')) return
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/job/admin/reject/${id}`, {}, { withCredentials: true })
      success('Từ chối job thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Từ chối thất bại')
      console.error('Failed to reject job:', serverData || err.message)
      toastError(msg)
    }
  }

  const getStatusBadge = (status) => {
    // Chuyển đổi string thành number nếu cần
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    
    switch (statusNum) {
      case 0:
        return <CBadge color="warning">Chờ duyệt</CBadge>
      case 1:
        return <CBadge color="success">Thông qua</CBadge>
      case 2:
        return <CBadge color="danger">Từ chối</CBadge>
      default:
        return <CBadge color="secondary">Không xác định ({status})</CBadge>
    }
  }

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {String(error.message || error)}</div>

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <strong>Jobs</strong>
            <CButtonGroup role="group" aria-label="Status filter">
              <CButton 
                color={statusFilter === 'all' ? 'primary' : 'outline-primary'} 
                size="sm" 
                onClick={() => setStatusFilter('all')}
              >
                Tất cả
              </CButton>
              <CButton 
                color={statusFilter === '0' ? 'warning' : 'outline-warning'} 
                size="sm" 
                onClick={() => setStatusFilter('0')}
              >
                Chờ duyệt
              </CButton>
              <CButton 
                color={statusFilter === '1' ? 'success' : 'outline-success'} 
                size="sm" 
                onClick={() => setStatusFilter('1')}
              >
                Thông qua
              </CButton>
              <CButton 
                color={statusFilter === '2' ? 'danger' : 'outline-danger'} 
                size="sm" 
                onClick={() => setStatusFilter('2')}
              >
                Từ chối
              </CButton>
            </CButtonGroup>
          </div>
          <CButton type="button" color="success" size="sm" className="d-inline-flex align-items-center gap-2" onClick={handleAdd}>
            <CIcon icon={cilPlus} />
            <span>Add new</span>
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <SearchBox 
              placeholder="Tìm kiếm theo tên công việc, mô tả, yêu cầu, ID..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              className="me-3"
            />
            <div className="text-muted small">
              Hiển thị {filteredJobs.length} / {data?.length || 0} công việc
            </div>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
            <CTable striped hover bordered small align="middle" className="mb-0" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1300px' }}>
              <CTableCaption placement="top">Danh sách jobs</CTableCaption>
              <CTableHead color="light" className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: 200 }}>Actions</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 120 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 120 }}>Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Company ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Field ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Province ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>Job name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 280 }}>Request</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 280 }}>Description</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>Other</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>Salary Min</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>Salary Max</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>Sex</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Type</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Education</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Experience</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>Created</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>Deleted</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredJobs?.length ? filteredJobs.map((item) => (
                  <CTableRow key={item.id} className="align-middle">
                    <CTableDataCell className="text-center">
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex gap-1 justify-content-center">
                          <CButton 
                            size="sm" 
                            color="primary" 
                            variant="outline" 
                            onClick={() => handleEdit(item)} 
                            className="action-btn"
                          >
                            <CIcon icon={cilPencil} />
                            <span>Edit</span>
                          </CButton>
                          <CButton 
                            size="sm" 
                            color="danger" 
                            variant="outline" 
                            onClick={() => handleDelete(item.id)} 
                            className="action-btn"
                          >
                            <CIcon icon={cilTrash} />
                            <span>Delete</span>
                          </CButton>
                        </div>
                        {(typeof item.status === 'string' ? parseInt(item.status) : item.status) === 0 && (
                          <div className="d-flex gap-1 justify-content-center">
                            <CButton 
                              size="sm" 
                              color="success" 
                              variant="outline" 
                              onClick={() => handleApprove(item.id)} 
                              className="action-btn"
                            >
                              <CIcon icon={cilCheck} />
                              <span>Duyệt</span>
                            </CButton>
                            <CButton 
                              size="sm" 
                              color="danger" 
                              variant="outline" 
                              onClick={() => handleReject(item.id)} 
                              className="action-btn"
                            >
                              <CIcon icon={cilX} />
                              <span>Từ chối</span>
                            </CButton>
                          </div>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.id)}>{item.id}</CTableDataCell>
                    <CTableDataCell className="text-center">{getStatusBadge(item.status)}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.idCompany)}>{item.idCompany}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.idField)}>{item.idField}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.idProvince)}>{item.idProvince}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.nameJob}>{item.nameJob}</CTableDataCell>
                    <CTableDataCell className="text-truncate" style={{ maxWidth: 260 }} title={item.request}><span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>{item.request}</span></CTableDataCell>
                    <CTableDataCell className="text-truncate" style={{ maxWidth: 260 }} title={item.desc}><span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>{item.desc}</span></CTableDataCell>
                    <CTableDataCell className="text-truncate" style={{ maxWidth: 220 }} title={item.other}><span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>{item.other}</span></CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.salaryMin)}>{item.salaryMin}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.salaryMax)}>{item.salaryMax}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.sex}>{item.sex}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.typeWork}>{item.typeWork}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.education}>{item.education}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.experience}>{item.experience}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.createdAt)}>{String(item.createdAt)}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.deletedAt)}>{String(item.deletedAt || '')}</CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan={17} className="text-center">Không có dữ liệu</CTableDataCell>
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
        error={formError}
        setError={setFormError}
      />
    </>
  )
}

export default Jobs