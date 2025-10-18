import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const [provinces, setProvinces] = useState([]);
  const [loadingProvince, setLoadingProvince] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvince(true);
      try {
        const res = await makeRequest.get("/provinces");
        setProvinces(res.data || []);
      } catch (_) {
        setProvinces([]);
      }
      setLoadingProvince(false);
    };
    if (open) fetchProvinces();
  }, [open]);

  const provinceOptions = useMemo(() => {
    const list = Array.isArray(provinces) ? provinces : [];
    return [{ value: "", label: "Chọn tỉnh/thành" }, ...list.map((p) => ({ value: p.pId ?? p.id, label: p.name }))];
  }, [provinces]);

  return (
    <CModal visible={open} onClose={onClose} size="xl">
      <CModalHeader>
        <CModalTitle>{isEdit ? "Edit Company" : "Add Company"}</CModalTitle>
      </CModalHeader>
      <Formik
        enableReinitialize
        initialValues={{
          id: currentItem?.id || "",
          nameCompany: currentItem?.nameCompany || "",
          nameAdmin: currentItem?.nameAdmin || "",
          email: currentItem?.email || "",
          password: "",
          avatarPic: currentItem?.avatarPic || "",
          phone: currentItem?.phone || "",
          idProvince: currentItem?.idProvince || "",
          intro: currentItem?.intro || "",
          scale: currentItem?.scale || "",
          web: currentItem?.web || "",
        }}
        validationSchema={Yup.object({
          nameCompany: Yup.string().required("Required"),
          nameAdmin: Yup.string().required("Required"),
          email: Yup.string().email("Invalid email").required("Required"),
          password: isEdit
            ? Yup.string()
            : Yup.string()
                .min(6, "Min 6 chars")
                .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, "Weak password")
                .required("Required"),
        })}
        onSubmit={(values) => {
          setError(""); // Xóa lỗi cũ khi submit
          onSubmit({
            ...values,
            idProvince: values.idProvince === "" ? null : values.idProvince,
          });
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
              if (filename) {
                setFieldValue("avatarPic", filename);
              }
            } catch (_) {
              // ignore; lỗi upload sẽ được xử lý bởi toast ở ngoài nếu cần
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
                    label="Company Name"
                    name="nameCompany"
                    value={values.nameCompany}
                    onChange={handleChange}
                    feedbackInvalid={errors.nameCompany}
                    invalid={!!(touched.nameCompany && errors.nameCompany)}
                    required
                    placeholder="Công ty ABC"
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Admin Name"
                    name="nameAdmin"
                    value={values.nameAdmin}
                    onChange={handleChange}
                    feedbackInvalid={errors.nameAdmin}
                    invalid={!!(touched.nameAdmin && errors.nameAdmin)}
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
                    label="Province"
                    name="idProvince"
                    value={values.idProvince}
                    onChange={handleChange}
                    disabled={loadingProvince}
                  >
                    {provinceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Scale"
                    name="scale"
                    value={values.scale}
                    onChange={handleChange}
                    placeholder="10-50 nhân sự"
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Website"
                    name="web"
                    value={values.web}
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


