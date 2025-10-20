import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { useQuery } from '@tanstack/react-query'
import makeRequest from '../../makeRequest'
import axios from 'axios'
import { useToast } from '../../components/GlobalToast'
import Loading from '../../components/Loading'
import AddOrEditDialog from './AddOrEditDialog'
import SearchBox from '../../components/SearchBox'
import '../../components/SearchBox.css'

const Follow = () => {
  useEffect(() => {
    document.title = 'Quản lý Theo dõi - SDU-JobQuest Admin'
  }, [])
  const { success, error: toastError } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFollows, setFilteredFollows] = useState([])

  const formatDateDisplay = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return String(value)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const getFollows = async () => {
    const res = await makeRequest.get('/follow/admin?limit=200')
    return res.data?.data || []
  }

  const { isLoading, error, data, refetch } = useQuery({ queryKey: ['follows'], queryFn: getFollows })

  // Filter follows based on search term
  useEffect(() => {
    if (data) {
      if (!searchTerm.trim()) {
        setFilteredFollows(data);
      } else {
        const filtered = data.filter(follow => 
          follow.id?.toString().includes(searchTerm.toLowerCase()) ||
          follow.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          follow.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          follow.user_id?.toString().includes(searchTerm.toLowerCase()) ||
          follow.company_id?.toString().includes(searchTerm.toLowerCase()) ||
          follow.job_id?.toString().includes(searchTerm.toLowerCase())
        );
        setFilteredFollows(filtered);
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
        await axios.put(`${import.meta.env.VITE_API_URL}/follow/admin/update`, values, { withCredentials: true })
        success('Cập nhật follow thành công')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/follow/admin/insert`, values, { withCredentials: true })
        success('Thêm follow thành công')
      }
      setOpenDialog(false); refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Thao tác thất bại')
      console.error('Failed to add/update follow:', serverData || err.message)
      toastError(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá follow này?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/follow/admin/delete/${id}`, { withCredentials: true })
      success('Xoá follow thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Xoá thất bại')
      console.error('Failed to delete follow:', serverData || err.message)
      toastError(msg)
    }
  }

  if (isLoading) return <Loading text="Đang tải danh sách theo dõi..." />
  if (error) return <div>Lỗi: {String(error.message || error)}</div>

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Follow Company</strong>
          <CButton type="button" color="success" size="sm" className="d-inline-flex align-items-center gap-2" onClick={handleAdd}>
            <CIcon icon={cilPlus} />
            <span>Add new</span>
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <SearchBox 
              placeholder="Tìm kiếm theo ID, email user, tên công ty..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              className="me-3"
            />
            <div className="text-muted small">
              Hiển thị {filteredFollows.length} / {data?.length || 0} theo dõi
            </div>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
            <CTable striped hover bordered small align="middle" className="mb-0" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1100px' }}>
              <CTableCaption placement="top">Danh sách follow_company</CTableCaption>
              <CTableHead color="light" className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: 160 }}>Actions</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 100 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>User Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 280 }}>Company Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Created</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredFollows?.length ? filteredFollows.map((item) => (
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
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.companyName)}>{item.companyName}</CTableDataCell>
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

export default Follow



