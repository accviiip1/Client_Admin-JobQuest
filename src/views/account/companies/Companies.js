import React, { useState, useEffect } from 'react'
import { CAvatar, CBadge, CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CInputGroup, CFormInput } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilSearch, cilFilter } from '@coreui/icons'
import { useQuery } from "@tanstack/react-query";
import makeRequest from "../../../makeRequest";
import axios from "axios";
import { useToast } from "../../../components/GlobalToast";

const Companies = () => {
  useEffect(() => {
    document.title = 'Quản lý Công ty - SDU-JobQuest Admin'
  }, [])
  const { success, error: toastError } = useToast();
  const [filterProvince, setFilterProvince] = useState('');
  const [filterScale, setFilterScale] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // default, a-z, z-a

  const getCompanies = async () => {
    const res = await makeRequest.get("/company")
    return res.data?.data || []
  }

  const getProvinces = async () => {
    const res = await makeRequest.get("/provinces")
    return res.data || []
  }

  const getScaleOptions = async () => {
    try {
      const res = await makeRequest.get("/lookup-data/category/scale")
      const scaleData = res.data?.data || []
      return [
        { value: '', label: 'Tất cả quy mô' },
        ...scaleData.map(item => ({
          value: item.name, // Sử dụng name thay vì value để match với companies.scale
          label: item.label || item.name
        }))
      ]
    } catch (error) {
      console.error('Error fetching scale options:', error)
      // Fallback to hardcoded values if API fails
      return [
        { value: '', label: 'Tất cả quy mô' },
        { value: 'ít hơn 10', label: 'ít hơn 10 nhân viên' },
        { value: '10 - 20', label: '10 - 20 nhân viên' },
        { value: '20 - 100', label: '20 - 100 nhân viên' },
        { value: '100 - 500', label: '100 - 500 nhân viên' },
        { value: '500 - 1000', label: '500 - 1000 nhân viên' },
        { value: '1000 - 5000', label: '1000 - 5000 nhân viên' },
        { value: 'nhiều hơn 5000', label: 'nhiều hơn 5000 nhân viên' }
      ]
    }
  }

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  })

  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces
  })

  const { data: scaleOptions } = useQuery({
    queryKey: ['scale-options'],
    queryFn: getScaleOptions
  })

  // Debug data
  console.log('Companies data:', data)
  console.log('Provinces data:', provinces)
  console.log('Scale options:', scaleOptions)
  console.log('Filter province:', filterProvince)
  console.log('Filter scale:', filterScale)

  // Filter and sort companies
  const filteredData = data?.filter(company => {
    const matchesSearch = !searchTerm || 
      company.nameCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nameAdmin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProvince = !filterProvince || company.province === filterProvince
    const matchesScale = !filterScale || company.scale === filterScale
    
    // Debug scale filtering
    if (filterScale) {
      console.log('Filtering scale:', {
        filterScale,
        companyScale: company.scale,
        matches: company.scale === filterScale
      })
    }
    
    return matchesSearch && matchesProvince && matchesScale
  }) || []

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === 'a-z') {
      return a.nameCompany?.localeCompare(b.nameCompany, 'vi') || 0
    } else if (sortOrder === 'z-a') {
      return b.nameCompany?.localeCompare(a.nameCompany, 'vi') || 0
    }
    // default: keep original order (by ID desc)
    return 0
  })


  const handleDelete = async (id) => {
    if (!window.confirm('Xoá công ty này?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/company/delete/${id}`, { withCredentials: true })
      success('Xoá công ty thành công')
      refetch()
    } catch (err) {
      console.error('Failed to delete company:', err?.response?.data || err.message)
      toastError(err?.response?.data?.message || 'Xoá thất bại')
    }
  }

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {String(error.message || error)}</div>

  return (
    <>
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <strong>Companies</strong>
          </div>
          <div className="row g-3">
            <div className="col-md-3">
              <CInputGroup>
                <CFormInput
                  placeholder="Tìm kiếm công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CButton color="secondary" variant="outline">
                  <CIcon icon={cilSearch} />
                </CButton>
              </CInputGroup>
            </div>
            <div className="col-md-3">
              <CFormSelect
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
              >
                <option value="">Tất cả tỉnh thành</option>
                {provinces?.map(province => (
                  <option key={province.id} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="col-md-3">
              <CFormSelect
                value={filterScale}
                onChange={(e) => setFilterScale(e.target.value)}
              >
                {scaleOptions?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )) || (
                  <option value="">Đang tải...</option>
                )}
              </CFormSelect>
            </div>
            <div className="col-md-3">
              <CFormSelect
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">Sắp xếp mặc định</option>
                <option value="a-z">A - Z</option>
                <option value="z-a">Z - A</option>
              </CFormSelect>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
            <CTable striped hover bordered small align="middle" className="mb-0" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1200px' }}>
              <CTableCaption placement="top">
                Danh sách công ty ({sortedData.length} kết quả)
              </CTableCaption>
              <CTableHead color="light" className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: 160 }}>Actions</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: 80 }}>Avatar</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>Name Company</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Name Admin</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 240 }}>Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>Phone</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 160 }}>Province</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Scale</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 200 }}>Website</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sortedData?.length ? sortedData.map((item) => (
                  <CTableRow key={item.id} className="align-middle">
                    <CTableDataCell className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(item.id)} className="d-inline-flex align-items-center gap-1">
                          <CIcon icon={cilTrash} />
                          <span>Delete</span>
                        </CButton>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center" style={{ width: 72 }}>
                      <CAvatar src={item.avatarPic ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/images/${item.avatarPic}` : `${import.meta.env.VITE_API_URL.replace('/api', '')}/images/avatar.avif` } size="md" />
                    </CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.nameCompany}>{item.nameCompany}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.nameAdmin}>{item.nameAdmin}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={item.email}>{item.email}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.phone)}>{item.phone}</CTableDataCell>
                    <CTableDataCell className="text-truncate text-nowrap" title={String(item.province)}>{item.province}</CTableDataCell>
                    <CTableDataCell>{item.scale}</CTableDataCell>
                    <CTableDataCell className="text-truncate" style={{ maxWidth: 220 }}>
                      <span title={item.web} className="text-nowrap d-inline-block" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.web}</span>
                    </CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center">Không có dữ liệu</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Companies


