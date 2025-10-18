import React, { useEffect, useMemo, useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormInput, CFormSelect, CRow, CCol } from '@coreui/react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import makeRequest from '../../makeRequest'

const AddOrEditDialog = ({ open, onClose, currentItem, onSubmit }) => {
  const isEdit = !!currentItem
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, c] = await Promise.all([
          makeRequest.get('/user/getAllUser'),
          makeRequest.get('/company?limit=200'),
        ])
        setUsers(u.data || [])
        setCompanies(c.data?.data || [])
      } catch (_) {}
    }
    if (open) load()
  }, [open])

  const userOptions = useMemo(() => [{ value: '', label: 'Chọn user' }, ...users.map(u => ({ value: u.id, label: `${u.email}` }))], [users])
  const companyOptions = useMemo(() => [{ value: '', label: 'Chọn company' }, ...companies.map(j => ({ value: j.id, label: j.nameCompany }))], [companies])

  const toDatetimeLocal = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return ''
    const tz = d.getTimezoneOffset() * 60000
    const local = new Date(d.getTime() - tz)
    return local.toISOString().slice(0, 16)
  }
  const toMySQLDatetime = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (isNaN(d)) return value
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear(); const mm = pad(d.getMonth() + 1); const dd = pad(d.getDate())
    const hh = pad(d.getHours()); const mi = pad(d.getMinutes()); const ss = pad(d.getSeconds())
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
  }

  return (
    <CModal visible={open} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{isEdit ? 'Edit Follow' : 'Add Follow'}</CModalTitle>
      </CModalHeader>
      <Formik
        enableReinitialize
        initialValues={{
          id: currentItem?.id || '',
          idUser: currentItem?.idUser || '',
          idCompany: currentItem?.idCompany || '',
          createdAt: toDatetimeLocal(currentItem?.createdAt),
        }}
        validationSchema={Yup.object({
          idUser: Yup.number().required('Required'),
          idCompany: Yup.number().required('Required'),
        })}
        onSubmit={(values) => {
          onSubmit({
            ...values,
            createdAt: values.createdAt ? toMySQLDatetime(values.createdAt) : null,
          })
          onClose()
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
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
                  <CFormSelect label="Company" name="idCompany" value={values.idCompany} onChange={handleChange} required>
                    {companyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label="Created At" name="createdAt" type="datetime-local" value={values.createdAt} onChange={handleChange} />
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



