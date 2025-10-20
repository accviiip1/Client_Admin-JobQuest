import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { useQuery } from '@tanstack/react-query'
import makeRequest from '../../../makeRequest'
import axios from 'axios'
import { useToast } from '../../../components/GlobalToast'
import Loading from '../../../components/Loading'
import AddOrEditDialog from './AddOrEditDialog'
import SearchBox from '../../../components/SearchBox'
import '../../../components/SearchBox.css'

const SaveJob = () => {
  const { success, error: toastError } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSaves, setFilteredSaves] = useState([])

  const formatDateDisplay = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return String(value)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const getSaves = async () => {
    const res = await makeRequest.get('/save/admin?limit=200')
    return res.data?.data || []
  }

  const { isLoading, error, data, refetch } = useQuery({ queryKey: ['saves'], queryFn: getSaves })

  // Filter saves based on search term
  React.useEffect(() => {
    if (data) {
      if (!searchTerm.trim()) {
        setFilteredSaves(data);
      } else {
        const filtered = data.filter(save => 
          save.id?.toString().includes(searchTerm.toLowerCase()) ||
          save.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          save.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          save.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          save.user_id?.toString().includes(searchTerm.toLowerCase()) ||
          save.job_id?.toString().includes(searchTerm.toLowerCase())
        );
        setFilteredSaves(filtered);
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
        await axios.put(`${import.meta.env.VITE_API_URL}/save/admin/update`, values, { withCredentials: true })
        success('Cập nhật save thành công')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/save/admin/insert`, values, { withCredentials: true })
        success('Thêm save thành công')
      }
      setOpenDialog(false); refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Thao tác thất bại')
      console.error('Failed to add/update save:', serverData || err.message)
      toastError(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá lưu job này?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/save/admin/delete/${id}`, { withCredentials: true })
      success('Xoá save thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Xoá thất bại')
      console.error('Failed to delete save:', serverData || err.message)
      toastError(msg)
    }
  }

  if (isLoading) return <Loading text="Đang tải danh sách lưu việc làm..." />
  if (error) return <div>Lỗi: {String(error.message || error)}</div>

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Save Jobs</strong>
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
              Hiển thị {filteredSaves.length} / {data?.length || 0} lưu công việc
            </div>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
            <CTable striped hover bordered small align="middle" className="mb-0" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1000px' }}>
              <CTableCaption placement="top">Danh sách save_job</CTableCaption>
              <CTableHead color="light" className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: 160 }}>Actions</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 100 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>User Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>Job Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Created</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSaves?.length ? filteredSaves.map((item) => (
                  <CTableRow key={item.id} className="align-middle">
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
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.createdAt)}>{formatDateDisplay(item.createdAt)}</CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center">Không có dữ liệu</CTableDataCell>
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
    </>
  )
}

export default SaveJob


