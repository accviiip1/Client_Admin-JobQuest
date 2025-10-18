import React, { createContext, useContext, useState, useCallback } from 'react'
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle, cilInfo } from '@coreui/icons'

const ToastContext = createContext({ success: () => {}, error: () => {} })

export const useToast = () => useContext(ToastContext)

const GlobalToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const push = useCallback((color, message) => {
    const id = Date.now() + Math.random()
    const normalizeMessage = (msg) => {
      if (msg == null) return ''
      if (typeof msg === 'string') return msg
      if (typeof msg === 'object') {
        const candidate = msg.message || msg.error || msg.fatal || msg.msg || msg.title || msg.detail
        if (typeof candidate === 'string') return candidate
        try {
          return JSON.stringify(msg)
        } catch (e) {
          return String(msg)
        }
      }
      return String(msg)
    }
    const safeMessage = normalizeMessage(message)
    setToasts((prev) => [...prev, { id, color, message: safeMessage }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const success = useCallback((message) => push('success', message), [push])
  const error = useCallback((message) => push('danger', message), [push])

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <CToaster placement="top-end" className="p-3">
        {toasts.map((t) => {
          const icon = t.color === 'success' ? cilCheckCircle : t.color === 'danger' ? cilXCircle : cilInfo
          return (
            <CToast key={t.id} color={t.color} autohide visible className="border-0 shadow-lg" role="alert">
              <div className="d-flex align-items-center">
                <div className="px-3 py-2 d-flex align-items-center">
                  <CIcon icon={icon} className="text-white me-2" size="lg" />
                  <CToastBody className="text-white fs-6 py-0">{t.message}</CToastBody>
                </div>
                <CToastClose className="me-2 ms-auto btn-close-white" />
              </div>
            </CToast>
          )
        })}
      </CToaster>
    </ToastContext.Provider>
  )
}

export default GlobalToastProvider


