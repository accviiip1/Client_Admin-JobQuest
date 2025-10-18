import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormInput, CRow, CCol } from '@coreui/react'
import { Formik } from 'formik'
import * as Yup from 'yup'

const AddOrEditDialog = ({ open, onClose, currentItem, onSubmit, error, setError }) => {
  const isEdit = !!currentItem
  return (
    <CModal visible={open} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{isEdit ? 'Edit Field' : 'Add Field'}</CModalTitle>
      </CModalHeader>
      <Formik
        enableReinitialize
        initialValues={{
          id: currentItem?.id || '',
          name: currentItem?.name || '',
          typeField: currentItem?.typeField || '',
        }}
        validationSchema={Yup.object({
          name: Yup.string().required('Required'),
        })}
        onSubmit={(values) => { 
          setError(""); // Xóa lỗi cũ khi submit
          onSubmit(values); 
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
                  <CFormInput label="Name" name="name" value={values.name} onChange={handleChange} required invalid={!!(touched.name && errors.name)} />
                </CCol>
                <CCol xs={12}>
                  <CFormInput label="Type" name="typeField" value={values.typeField} onChange={handleChange} />
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



