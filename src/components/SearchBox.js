import React, { useState } from 'react'
import { CInputGroup, CFormInput, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilX } from '@coreui/icons'

const SearchBox = ({ 
  placeholder = "Tìm kiếm...", 
  onSearch, 
  onClear,
  className = "",
  size = "md"
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value) => {
    setSearchTerm(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    if (onClear) {
      onClear()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  return (
    <CInputGroup className={`search-box ${className}`} size={size}>
      <CFormInput
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyPress={handleKeyPress}
        className="search-input"
      />
      {searchTerm && (
        <CButton
          color="secondary"
          variant="outline"
          onClick={handleClear}
          className="clear-btn"
        >
          <CIcon icon={cilX} />
        </CButton>
      )}
      <CButton
        color="primary"
        onClick={() => handleSearch(searchTerm)}
        className="search-btn"
      >
        <CIcon icon={cilSearch} />
      </CButton>
    </CInputGroup>
  )
}

export default SearchBox







