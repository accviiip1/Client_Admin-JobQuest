import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useAuth } from '../../context/authContext'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const { logoutCompany, logoutUser, currentCompany, currentUser } = useAuth()
  const handleLogout = async () => {
    try {
      if (currentCompany) await logoutCompany();
      else await logoutUser();
    } catch (e) {
      try { await logoutUser() } catch (_) {}
    }
  }
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem component="button" onClick={handleLogout}>
          <CIcon icon={cilAccountLogout } className="me-2" />
          Log Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
