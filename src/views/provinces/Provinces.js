import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { useQuery } from '@tanstack/react-query'
import makeRequest from '../../makeRequest'
import axios from 'axios'
import { useToast } from '../../components/GlobalToast'
import AddOrEditDialog from './AddOrEditDialog'
import SearchBox from '../../components/SearchBox'
import '../../components/SearchBox.css'

const Provinces = () => {
  useEffect(() => {
    document.title = 'Quản lý Tỉnh thành - SDU-JobQuest Admin'
  }, [])
  const { success, error: toastError } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [formError, setFormError] = useState("")
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProvinces, setFilteredProvinces] = useState([])

  const getProvinces = async () => {
    const res = await makeRequest.get('/provinces/admin')
    return res.data || []
  }

  const { isLoading, error, data, refetch } = useQuery({ queryKey: ['provinces-admin'], queryFn: getProvinces })

  // Filter provinces based on search term
  useEffect(() => {
    if (data) {
      if (!searchTerm.trim()) {
        setFilteredProvinces(data);
      } else {
        const filtered = data.filter(province => 
          province.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          province.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProvinces(filtered);
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
        await axios.put(`${import.meta.env.VITE_API_URL}/provinces/admin/update`, values, { withCredentials: true })
        success('Cập nhật province thành công')
        setOpenDialog(false); 
        refetch()
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/provinces/admin/insert`, values, { withCredentials: true })
        success('Thêm province thành công')
        setOpenDialog(false); 
        refetch()
      }
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Thao tác thất bại')
      console.error('Failed to add/update province:', serverData || err.message)
      // Hiển thị lỗi ở form thay vì toast
      setFormError(msg);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá province này?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/provinces/admin/delete/${id}`, { withCredentials: true })
      success('Xoá province thành công')
      refetch()
    } catch (err) {
      const serverData = err?.response?.data
      const msg = typeof serverData === 'string' ? serverData : (serverData?.message || err.message || 'Xoá thất bại')
      console.error('Failed to delete province:', serverData || err.message)
      toastError(msg)
    }
  }

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {String(error.message || error)}</div>

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Provinces</strong>
          <CButton type="button" color="success" size="sm" className="d-inline-flex align-items-center gap-2" onClick={handleAdd}>
            <CIcon icon={cilPlus} />
            <span>Add new</span>
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <SearchBox 
              placeholder="Tìm kiếm theo tên tỉnh thành..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              className="me-3"
            />
            <div className="text-muted small">
              Hiển thị {filteredProvinces.length} / {data?.length || 0} tỉnh thành
            </div>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
            <CTable striped hover bordered small align="middle" className="mb-0" style={{ tableLayout: 'fixed', width: '100%', minWidth: '800px' }}>
              <CTableCaption placement="top">Danh sách provinces</CTableCaption>
              <CTableHead color="light" className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: 160 }}>Actions</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 280 }}>Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 320 }}>Name With Type</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredProvinces?.length ? filteredProvinces.map((item) => (
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
                    <CTableDataCell className="text-truncate text-nowrap" title={item.name}>{item.name}</CTableDataCell>
                    <CTableDataCell className="text-truncate" title={item.nameWithType}>{item.nameWithType}</CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center">Không có dữ liệu</CTableDataCell>
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

export default Provinces



