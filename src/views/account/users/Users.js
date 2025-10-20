import React, { useState, useEffect } from 'react'
import { CAvatar, CBadge, CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { useQuery } from "@tanstack/react-query";
import makeRequest from "../../../makeRequest";
import AddOrEditDialog from "./AddOrEditDialog";
import axios from "axios";
import { useToast } from "../../../components/GlobalToast";
import Loading from "../../../components/Loading";
import SearchBox from "../../../components/SearchBox";
import "../../../components/SearchBox.css";

const Users = () => {
    useEffect(() => {
        document.title = 'Quản lý Người dùng - SDU-JobQuest Admin'
    }, [])
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formError, setFormError] = useState(""); 
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const { success, error: toastError } = useToast();

    const truncateText = (text, maxLength = 50) => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]*>/g, '')
    }
    const formatDateDisplay = (value) => {
      if (!value) return ''
      const d = new Date(value)
      if (isNaN(d)) return String(value)
      const dd = String(d.getUTCDate()).padStart(2, '0')
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const yyyy = d.getUTCFullYear()
      return `${dd}/${mm}/${yyyy}`
    }

    const getUser = async () => {
      const res = await makeRequest.get("/user/getAllUser");
      return res.data; 
    };

    const { isLoading, error, data, refetch } = useQuery({
      queryKey: ["user"],
      queryFn: getUser,
    });

    // Filter users based on search term
    useEffect(() => {
      if (data) {
        if (!searchTerm.trim()) {
          setFilteredUsers(data);
        } else {
          const filtered = data.filter(user => 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.address?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredUsers(filtered);
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
      setEditData(null); // thêm mới -> không có dữ liệu
      setFormError(""); // Xóa lỗi khi mở dialog
      setOpenDialog(true);
    };
  
    const handleEdit = (item) => {
      setEditData(item); // truyền dữ liệu cần edit
      setFormError(""); // Xóa lỗi khi mở dialog
      setOpenDialog(true);
    };
  
    const handleClose = () => {
      setOpenDialog(false);
      setFormError(""); // Xóa lỗi khi đóng dialog
    };

    const handleSubmit = async (values) => {
      try {
        if (editData) {
          const res = await axios.put(
            `${import.meta.env.VITE_API_URL}/user/updateUserByAdmin`,
            values,
            { withCredentials: true }
          )
          console.log("User updated:", res.data)
          success("Cập nhật người dùng thành công")
          // Đóng dialog
          setOpenDialog(false);
          // Reload danh sách user
          refetch();
        } else {
          // Add mới
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/user/insertUser`,
            values
          );
          console.log("User added:", res.data);
          success("Thêm người dùng thành công")
          // Đóng dialog
          setOpenDialog(false);
          // Reload danh sách user
          refetch();
        }
      } catch (err) {
        const serverData = err && err.response ? err.response.data : null;
        const msg = typeof serverData === 'string' ? serverData : (serverData && serverData.message) || err.message || 'Thao tác thất bại';
        console.error("Failed to add/update user:", serverData || err.message);
        
        // Hiển thị lỗi ở form thay vì toast
        setFormError(msg);
      }
    };
    

    const [details, setDetails] = useState([])

    const toggleDetails = (id) => {
      const pos = details.indexOf(id);
      if (pos !== -1) {
        setDetails(details.filter((detailId) => detailId !== id));
      } else {
        setDetails([...details, id]);
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Xoá người dùng này?')) return
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/user/delete/${id}`, { withCredentials: true })
        success('Xoá người dùng thành công')
        refetch()
      } catch (err) {
        const serverData = err && err.response ? err.response.data : null;
        const msg = typeof serverData === 'string' ? serverData : (serverData && serverData.message) || err.message || 'Xoá thất bại';
        console.error('Failed to delete user:', serverData || err.message)
        toastError(msg)
      }
    }

  if (isLoading) return <Loading text="Đang tải danh sách người dùng..." />;
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
		<>
			<CCard>
				<CCardHeader className="d-flex justify-content-between align-items-center">
					<strong>Users</strong>
					<CButton type="button" color="success" size="sm" className="d-inline-flex align-items-center gap-2" onClick={() => handleAdd()}>
						<CIcon icon={cilPlus} />
						<span>Add new</span>
					</CButton>
				</CCardHeader>
				<CCardBody>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<SearchBox 
							placeholder="Tìm kiếm theo tên, email, số điện thoại..."
							onSearch={handleSearch}
							onClear={handleClearSearch}
							className="me-3"
						/>
						<div className="text-muted small">
							Hiển thị {filteredUsers.length} / {data?.length || 0} người dùng
						</div>
					</div>
					<div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
						<CTable
							striped
							hover
							bordered
							responsive="md"
							small
							align="middle"
							className="mb-0"
							style={{ tableLayout: 'fixed', width: '100%', minWidth: '1300px' }}
						>
						<CTableCaption placement="top">Danh sách người dùng</CTableCaption>
						<CTableHead color="light" className="text-nowrap">
							<CTableRow>
								<CTableHeaderCell className="text-center" style={{ width: 160 }}>Actions</CTableHeaderCell>
								<CTableHeaderCell className="text-center" style={{ width: 80 }}>Avatar</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 200 }}>Name</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 240 }}>Email</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 160 }}>Province</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 140 }}>Phone</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 140 }}>Birth Day</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 280 }}>Introduce</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 240 }}>Link Social</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 120 }}>Sex</CTableHeaderCell>
								<CTableHeaderCell style={{ width: 140 }}>Privilege</CTableHeaderCell>
							</CTableRow>
						</CTableHead>
						<CTableBody>
							{filteredUsers && filteredUsers.length > 0 ? (
								filteredUsers.map((item) => (
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
										<CTableDataCell className="text-center" style={{ width: 72 }}>
											<CAvatar
												src={
													item.avatarPic
														? `${import.meta.env.VITE_API_URL.replace('/api', '')}/images/${item.avatarPic}`
														: `${import.meta.env.VITE_API_URL.replace('/api', '')}/images/avatar.avif`
												}
												alt={item.name}
												size="md"
											/>
										</CTableDataCell>
										<CTableDataCell className="text-truncate text-nowrap" title={item.name}>{item.name}</CTableDataCell>
										<CTableDataCell className="text-truncate text-nowrap" title={item.email}>{item.email}</CTableDataCell>
										<CTableDataCell className="text-truncate text-nowrap" title={String(item.idProvince)}>{item.idProvince}</CTableDataCell>
										<CTableDataCell className="text-truncate text-nowrap" title={String(item.phone)}>{item.phone}</CTableDataCell>
										<CTableDataCell title={String(item.birthDay)}>{formatDateDisplay(item.birthDay)}</CTableDataCell>
										<CTableDataCell className="text-truncate" style={{ maxWidth: 240 }}>
											<span title={stripHtml(item.intro)}>{truncateText(stripHtml(item.intro), 50)}</span>
										</CTableDataCell>
										<CTableDataCell className="text-truncate" style={{ maxWidth: 240 }}>
											<span title={item.linkSocial} className="text-nowrap d-inline-block" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.linkSocial}</span>
										</CTableDataCell>
										<CTableDataCell>
											<CBadge color="info" className="text-uppercase">{item.sex}</CBadge>
										</CTableDataCell>
										<CTableDataCell>
											<CBadge color={String(item.privilege).toLowerCase() === 'admin' ? 'danger' : 'success'}>
												{item.privilege}
											</CBadge>
										</CTableDataCell>
									</CTableRow>
								))
							) : (
								<CTableRow>
									<CTableDataCell colSpan={13} className="text-center">
										Không có dữ liệu
									</CTableDataCell>
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

export default Users
