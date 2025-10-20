import React, { useEffect, useMemo, useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormInput, CFormSelect, CRow, CCol, CFormTextarea } from '@coreui/react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import makeRequest from '../../../makeRequest'

const AddOrEditDialog = ({ open, onClose, currentItem, onSubmit, error, setError }) => {
  const isEdit = !!currentItem
  const [companies, setCompanies] = useState([])
  const [provinces, setProvinces] = useState([])
  const [fields, setFields] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [c, p, f] = await Promise.all([
          makeRequest.get('/company?limit=100'),
          makeRequest.get('/provinces'),
          makeRequest.get('/fields'),
        ])
        setCompanies(c.data?.data || [])
        setProvinces(p.data || [])
        setFields(f.data || [])
      } catch (_) {}
    }
    if (open) load()
  }, [open])

  const provinceOptions = useMemo(() => [{ value: '', label: 'Chọn tỉnh' }, ...provinces.map(p => ({ value: p.pId ?? p.id, label: p.name }))], [provinces])
  const fieldOptions = useMemo(() => [{ value: '', label: 'Chọn lĩnh vực' }, ...fields.map(f => ({ value: f.fId ?? f.id, label: f.name }))], [fields])
  const companyOptions = useMemo(() => [{ value: '', label: 'Chọn công ty' }, ...companies.map(c => ({ value: c.id, label: c.nameCompany }))], [companies])

  return (
    <CModal visible={open} onClose={onClose} size="xl">
      <CModalHeader>
        <CModalTitle>{isEdit ? 'Edit Job' : 'Add Job'}</CModalTitle>
      </CModalHeader>
      <Formik
        enableReinitialize
        initialValues={{
          id: currentItem?.id || '',
          idCompany: currentItem?.idCompany || '',
          idField: currentItem?.idField || '',
          idProvince: currentItem?.idProvince || '',
          nameJob: currentItem?.nameJob || '',
          request: currentItem?.request || '',
          desc: currentItem?.desc || '',
          other: currentItem?.other || '',
          salaryMin: currentItem?.salaryMin || '',
          salaryMax: currentItem?.salaryMax || '',
          sex: currentItem?.sex || '',
          typeWork: currentItem?.typeWork || '',
          education: currentItem?.education || '',
          experience: currentItem?.experience || '',
          deadline: currentItem?.deadline || '',
          status: currentItem?.status !== undefined ? currentItem.status : 0,
        }}
        validationSchema={Yup.object({
          idCompany: Yup.number().required('Required'),
          idField: Yup.number().required('Required'),
          idProvince: Yup.number().required('Required'),
          nameJob: Yup.string().required('Required'),
        })}
        onSubmit={(values) => {
          setError(""); // Xóa lỗi cũ khi submit
          onSubmit({
            ...values,
            idCompany: Number(values.idCompany),
            idField: Number(values.idField),
            idProvince: Number(values.idProvince),
            salaryMin: values.salaryMin === '' ? null : Number(values.salaryMin),
            salaryMax: values.salaryMax === '' ? null : Number(values.salaryMax),
            status: Number(values.status),
          })
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <CModalBody>
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}
              <CRow className="gy-3">
                <CCol xs={12} md={6}>
                  <CFormInput label="ID" name="id" value={values.id} onChange={handleChange} disabled placeholder="Auto generated" />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Job name" name="nameJob" value={values.nameJob} onChange={handleChange} required />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormSelect label="Company" name="idCompany" value={values.idCompany} onChange={handleChange} invalid={!!(touched.idCompany && errors.idCompany)}>
                    {companyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect label="Province" name="idProvince" value={values.idProvince} onChange={handleChange} invalid={!!(touched.idProvince && errors.idProvince)}>
                    {provinceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormSelect label="Field" name="idField" value={values.idField} onChange={handleChange} invalid={!!(touched.idField && errors.idField)}>
                    {fieldOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect label="Type Work" name="typeWork" value={values.typeWork} onChange={handleChange}>
                    <option value="">Chọn loại hình</option>
                    <option value="fulltime">Full-time</option>
                    <option value="parttime">Part-time</option>
                    <option value="intern">Intern</option>
                    <option value="remote">Remote</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput label="Salary Min" name="salaryMin" type="number" value={values.salaryMin} onChange={handleChange} />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Salary Max" name="salaryMax" type="number" value={values.salaryMax} onChange={handleChange} />
                </CCol>

                <CCol xs={12}>
                  <CFormTextarea label="Request" name="request" rows={3} value={values.request} onChange={handleChange} />
                </CCol>
                <CCol xs={12}>
                  <CFormTextarea label="Description" name="desc" rows={3} value={values.desc} onChange={handleChange} />
                </CCol>
                <CCol xs={12}>
                  <CFormTextarea label="Other" name="other" rows={3} value={values.other} onChange={handleChange} />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput label="Education" name="education" value={values.education} onChange={handleChange} />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Experience" name="experience" value={values.experience} onChange={handleChange} />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput 
                    label="Deadline" 
                    name="deadline" 
                    type="datetime-local" 
                    value={values.deadline ? new Date(values.deadline).toISOString().slice(0, 16) : ''} 
                    onChange={handleChange} 
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormSelect label="Status" name="status" value={values.status} onChange={handleChange}>
                    <option value={0}>Chờ duyệt</option>
                    <option value={1}>Thông qua</option>
                    <option value={2}>Từ chối</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Sex" name="sex" value={values.sex} onChange={handleChange} placeholder="Nam/Nữ/Không yêu cầu" />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={onClose}>Cancel</CButton>
              <CButton type="submit" color="primary">Save</CButton>
            </CModalFooter>
          </form>
        )}
      </Formik>
    </CModal>
  )
}

export default AddOrEditDialog



