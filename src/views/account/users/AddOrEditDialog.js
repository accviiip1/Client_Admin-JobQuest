// AddOrEditDialog.js
import React, { useRef } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CRow,
  CCol,
  CAvatar,
} from "@coreui/react";
import { Formik } from "formik";
import * as Yup from "yup";
import makeRequest from "../../../makeRequest";

const AddOrEditDialog = ({ open, onClose, currentItem, onSubmit, error, setError }) => {
  const isEdit = !!currentItem;

  const normalizeDateForInput = (value) => {
    if (!value) return "";
    // already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // try native Date parse (ISO, timestamp, etc.)
    const asDate = new Date(value);
    if (!isNaN(asDate)) return asDate.toISOString().slice(0, 10);
    // try dd/mm/yyyy
    const m = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (!isNaN(d)) return d.toISOString().slice(0, 10);
    }
    return "";
  };

  return (
    <CModal visible={open} onClose={onClose} size="xl">
      <CModalHeader>
        <CModalTitle>{isEdit ? "Edit User" : "Add User"}</CModalTitle>
      </CModalHeader>
      <Formik
        enableReinitialize
        initialValues={{
          id: currentItem?.id || "",
          name: currentItem?.name || "",
          email: currentItem?.email || "",
          password: "",
          phone: currentItem?.phone || "",
          avatarPic: currentItem?.avatarPic || "",
          birthDay: normalizeDateForInput(currentItem?.birthDay),
          intro: currentItem?.intro || "",
          linkSocial: currentItem?.linkSocial || "",
          sex: currentItem?.sex || "",
          privilege: currentItem?.privilege || "user",
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Required"),
          email: Yup.string().email("Invalid email").required("Required"),
          password: isEdit
            ? Yup.string()
            : Yup.string().min(6, 'Min 6 chars').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, 'Weak password').required("Required"),
        })}
        onSubmit={(values) => {
          setError(""); // Xóa lỗi cũ khi submit
          onSubmit(values);
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched, setFieldValue }) => {
          const fileRef = useRef(null);
          const apiRoot = (import.meta.env.VITE_API_URL || "").replace("/api", "");
          const previewUrl = values.avatarPic
            ? `${apiRoot}/images/${values.avatarPic}`
            : `${apiRoot}/images/avatar.avif`;

          const openFilePicker = () => fileRef.current && fileRef.current.click();
          const onFileChange = async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const form = new FormData();
            form.append("file", file);
            try {
              const res = await makeRequest.post("/upload", form, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
              });
              const filename = res.data;
              if (filename) setFieldValue("avatarPic", filename);
            } finally {
              if (fileRef.current) fileRef.current.value = "";
            }
          };

          return (
          <form onSubmit={handleSubmit}>
            <CModalBody>
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}
              <CRow className="gy-3">
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="ID"
                    name="id"
                    value={values.id}
                    onChange={handleChange}
                    disabled
                    placeholder="Auto generated"
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Birthday"
                    name="birthDay"
                    type="date"
                    value={values.birthDay}
                    onChange={handleChange}
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    feedbackInvalid={errors.name}
                    invalid={!!(touched.name && errors.name)}
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    feedbackInvalid={errors.email}
                    invalid={!!(touched.email && errors.email)}
                    required
                    placeholder="name@example.com"
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Password"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    feedbackInvalid={errors.password}
                    invalid={!!(touched.password && errors.password)}
                    required={!isEdit}
                    placeholder={isEdit ? "(giữ trống nếu không đổi)" : "••••••"}
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    placeholder="0912 345 678"
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Sex"
                    name="sex"
                    value={values.sex}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Privilege"
                    name="privilege"
                    value={values.privilege}
                    onChange={handleChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="d-flex align-items-center gap-3" style={{ marginTop: 24 }}>
                    <CAvatar src={previewUrl} size="lg" />
                    <div className="d-flex flex-column gap-2">
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
                      <CButton color="secondary" variant="outline" type="button" onClick={openFilePicker}>
                        Sửa ảnh
                      </CButton>
                      {values.avatarPic ? (
                        <small className="text-body-secondary">File: {values.avatarPic}</small>
                      ) : null}
                    </div>
                  </div>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Social Link"
                    name="linkSocial"
                    value={values.linkSocial}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormTextarea
                    label="Intro"
                    name="intro"
                    value={values.intro}
                    onChange={handleChange}
                    rows={5}
                  />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={onClose}>
                Cancel
              </CButton>
              <CButton type="submit" color="primary">
                Save
              </CButton>
            </CModalFooter>
          </form>
          );
        }}
      </Formik>
    </CModal>
  );
};

export default AddOrEditDialog;
