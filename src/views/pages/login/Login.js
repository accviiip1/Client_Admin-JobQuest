import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { useToast } from '../../../components/GlobalToast'


const Login = () => {
  useEffect(() => {
    document.title = 'Đăng nhập Admin - SDU-JobQuest Admin'
  }, [])

  const apiUrl = import.meta.env.VITE_CLIENT_URL;
  const { loginUser, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const { success, error: toastError } = useToast();

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await loginUser(inputs);
      setLoading(false);
      success('Đăng nhập thành công');
    } catch (err) {
      let message = 'Đăng nhập thất bại';
      
      // Xử lý các loại lỗi khác nhau
      if (err?.response?.status === 409) {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (err?.response?.status === 401) {
        message = 'Thông tin đăng nhập không hợp lệ';
      } else if (err?.response?.status === 404) {
        message = 'Tài khoản không tồn tại';
      } else if (err?.response?.status === 500) {
        message = 'Lỗi server, vui lòng thử lại sau';
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.response?.data?.fatal) {
        message = err.response.data.fatal;
      } else if (err?.message) {
        message = err.message;
      }
      
      setErr(message);
      toastError(message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    document.title = 'login';
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Email" autoComplete="email" name="email" id="email" onChange={handleChange} />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        name="password"
                        id="password"
                        onChange={handleChange}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                          Login
                        </CButton>
                      </CCol>
                      {err && (
                        <CCol xs={12} className="mt-2">
                          <span className="text-danger small">{String(err)}</span>
                        </CCol>
                      )}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Administrator</h2>
                    <p>
                      This is the admin page if you do not have permission please login with User permission
                    </p>
                    <CButton
                      color="primary"
                      className="mt-3"
                      active
                      tabIndex={-1}
                      onClick={() => window.location.href = `${apiUrl}/dang-nhap/nguoi-dung`}
                    >
                      User Login
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
