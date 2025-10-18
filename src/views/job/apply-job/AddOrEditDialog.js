import React, { useEffect, useMemo, useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormInput, CFormSelect, CRow, CCol, CFormTextarea } from '@coreui/react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import makeRequest from '../../../makeRequest'

const AddOrEditDialog = ({ open, onClose, currentItem, onSubmit }) => {
  const isEdit = !!currentItem
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])

  const toDatetimeLocal = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return ''
    // Convert to local time and format YYYY-MM-DDTHH:mm
    const tz = d.getTimezoneOffset() * 60000
    const local = new Date(d.getTime() - tz)
    return local.toISOString().slice(0, 16)
  }

  const toMySQLDatetime = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (isNaN(d)) return value
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    const ss = pad(d.getSeconds())
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [u, j] = await Promise.all([
          makeRequest.get('/user/getAllUser'),
          makeRequest.get('/job?limit=200'),
        ])
        setUsers(u.data || [])
        setJobs(j.data?.data || [])
      } catch (_) {}
    }
    if (open) load()
  }, [open])

  const userOptions = useMemo(() => [{ value: '', label: 'Chọn user' }, ...users.map(u => ({ value: u.id, label: `${u.email}` }))], [users])
  const jobOptions = useMemo(() => [{ value: '', label: 'Chọn job' }, ...jobs.map(j => ({ value: j.id, label: j.nameJob }))], [jobs])
  return (
    <CModal visible={open} onClose={onClose} size="xl">
      <CModalHeader>
        <CModalTitle>{isEdit ? 'Edit Apply' : 'Add Apply'}</CModalTitle>
      </CModalHeader>
      <Formik
        enableReinitialize
        initialValues={{
          id: currentItem?.id || '',
          idUser: currentItem?.idUser || '',
          idJob: currentItem?.idJob || '',
          name: currentItem?.name || '',
          email: currentItem?.email || '',
          phone: currentItem?.phone || '',
          status: currentItem?.status ?? 1,
          letter: currentItem?.letter || '',
          cv: currentItem?.cv || '',
          createdAt: toDatetimeLocal(currentItem?.createdAt),
          deletedAt: toDatetimeLocal(currentItem?.deletedAt),
        }}
        validationSchema={Yup.object({
          idUser: Yup.number().required('Required'),
          idJob: Yup.number().required('Required'),
          name: Yup.string().required('Required'),
          email: Yup.string().email('Invalid').required('Required'),
          phone: Yup.string().required('Required'),
          status: Yup.number().required('Required'),
        })}
        onSubmit={(values)=>{
          onSubmit({
            ...values,
            createdAt: values.createdAt ? toMySQLDatetime(values.createdAt) : null,
            deletedAt: values.deletedAt ? toMySQLDatetime(values.deletedAt) : null,
          });
          onClose();
        }}
      >
        {({ values, handleChange, handleSubmit, setFieldValue }) => {
          const onFileChange = async (e) => {
            const file = e.target.files && e.target.files[0]
            if (!file) return
            const form = new FormData()
            form.append('file', file)
            try {
              const res = await makeRequest.post('/uploadFile', form, { headers: { 'Content-Type': 'multipart/form-data' } })
              if (res?.data) setFieldValue('cv', res.data)
            } catch (_) {}
          }
          return (
          <form onSubmit={handleSubmit}>
            <CModalBody>
              <CRow className="gy-3">
                <CCol xs={12} md={6}>
                  <CFormInput label="ID" name="id" value={values.id} onChange={handleChange} disabled placeholder="Auto generated" />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect label="User" name="idUser" value={values.idUser} onChange={handleChange} required>
                    {userOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormSelect label="Job" name="idJob" value={values.idJob} onChange={handleChange} required>
                    {jobOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Name" name="name" value={values.name} onChange={handleChange} required />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput label="Email" name="email" type="email" value={values.email} onChange={handleChange} required />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Phone" name="phone" value={values.phone} onChange={handleChange} required />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormSelect label="Status" name="status" value={values.status} onChange={handleChange} required>
                    <option value={1}>Đã nộp</option>
                    <option value={2}>Đã xem</option>
                    <option value={3}>Liên hệ</option>
                    <option value={4}>Từ chối</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <div className="d-flex flex-column gap-2">
                    <CFormInput label="CV file name" name="cv" value={values.cv} onChange={handleChange} placeholder="filename.ext" disabled />
                    <CFormInput type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
                  </div>
                </CCol>

                <CCol xs={12}>
                  <CFormTextarea label="Letter" name="letter" rows={4} value={values.letter} onChange={handleChange} />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput label="Created At" name="createdAt" type="datetime-local" value={values.createdAt} onChange={handleChange} />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Deleted At" name="deletedAt" type="datetime-local" value={values.deletedAt} onChange={handleChange} />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={onClose}>Cancel</CButton>
              <CButton type="submit" color="primary">Save</CButton>
            </CModalFooter>
          </form>
          )
        }}
      </Formik>
    </CModal>
  )
}

export default AddOrEditDialog


