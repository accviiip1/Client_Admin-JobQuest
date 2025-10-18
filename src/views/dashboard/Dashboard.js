import React, { useMemo, useEffect, useState } from 'react'
import { Bar, Pie, Line } from 'react-chartjs-2'
import dayjs from 'dayjs'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'

// Removed demo assets and widgets
import { useQuery } from '@tanstack/react-query'
import makeRequest from '../../makeRequest'
import { main } from '@popperjs/core'

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard - SDU-JobQuest Admin'
  }, [])
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await makeRequest.get('/admin/stats')).data,
  })
  const colors = {
    users: { border: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.2)' },
    companies: { border: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.2)' },
    jobs: { border: 'rgba(75, 192, 192, 1)', bg: 'rgba(75, 192, 192, 0.2)' },
    applies: { border: 'rgba(255, 206, 86, 1)', bg: 'rgba(255, 206, 86, 0.2)' },
  }
  const summaryStats = [
    { title: '👤Users', value: stats?.totals?.users ?? 0, percent: stats?.totalsPercent?.users ?? 0 },
    {
      title: '🏢Companies',
      value: stats?.totals?.companies ?? 0,
      percent: stats?.totalsPercent?.companies ?? 0,
    },
    {
      title: '💼Jobs (active)',
      value: stats?.totals?.jobsActive ?? 0,
      percent: stats?.totalsPercent?.jobsActive ?? 0,
    },
    {
      title: '📄Applies',
      value: stats?.totals?.applies ?? 0,
      percent: stats?.totalsPercent?.applies ?? 0,
    },
    { title: '⭐Saves', value: stats?.totals?.saves ?? 0, percent: stats?.totalsPercent?.saves ?? 0 },
    {
      title: '👁️Follows',
      value: stats?.totals?.follows ?? 0,
      percent: stats?.totalsPercent?.follows ?? 0,
    },
  ]
  console.log('Full stats object:', stats)
  console.log('Available keys in stats:', Object.keys(stats || {}))
  
  // Debug: Kiểm tra dữ liệu monthly từ API
  console.log('=== API MONTHLY DATA ===')
  console.log('stats.usersMonthly:', stats?.usersMonthly)
  console.log('stats.companiesMonthly:', stats?.companiesMonthly)
  console.log('stats.appliesMonthly:', stats?.appliesMonthly)
  console.log('stats.jobsMonthly:', stats?.jobsMonthly)
  
  // Kiểm tra tất cả keys để tìm đúng tên
  if (stats) {
    Object.keys(stats).forEach(key => {
      if (key.toLowerCase().includes('user') || key.toLowerCase().includes('company') || key.toLowerCase().includes('apply')) {
        console.log(`Found key "${key}":`, stats[key])
      }
    })
  }

  // Logic để lấy 4 tháng gần nhất
  const getLast4MonthsData = useMemo(() => {
    if (!stats?.jobsMonthly) return { months: [], data: {} }
    
    const monthlyData = stats.jobsMonthly || []
    console.log('jobsMonthly data:', monthlyData)
    console.log('jobsMonthly length:', monthlyData.length)
    
    // Sắp xếp dữ liệu theo thời gian từ cũ đến mới
    const sortedData = [...monthlyData].sort((a, b) => {
      const dateA = dayjs(a.label)
      const dateB = dayjs(b.label)
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0
    })
    
    console.log('Original data:', monthlyData)
    console.log('Sorted data:', sortedData)
    
    // Lấy 4 tháng cuối (mới nhất) nhưng vẫn giữ thứ tự từ cũ đến mới
    const availableMonths = sortedData.length >= 4 ? sortedData.slice(-4) : sortedData
    console.log('availableMonths:', availableMonths)
    
    const months = availableMonths.map(m => dayjs(m.label).format('M/YYYY'))
    console.log('formatted months:', months)
    
    // Lấy dữ liệu monthly trực tiếp từ API
    const usersMonthlyData = stats.usersMonthly
    const companiesMonthlyData = stats.companiesMonthly
    const appliesMonthlyData = stats.appliesMonthly
    
    console.log('Found usersMonthlyData:', usersMonthlyData)
    console.log('Found companiesMonthlyData:', companiesMonthlyData)
    console.log('Found appliesMonthlyData:', appliesMonthlyData)
    
    // Hàm helper để tìm dữ liệu theo label
    const findDataByLabel = (dataArray, label) => {
      if (!dataArray || !Array.isArray(dataArray)) return 0
      const found = dataArray.find(item => item.label === label)
      return found ? found.value : 0
    }

    // Tạo dữ liệu với logic đơn giản hơn
    const data = {
      users: availableMonths.map((m) => {
        const value = findDataByLabel(usersMonthlyData, m.label)
        console.log(`User data for ${m.label}:`, value)
        return value
      }),
      companies: availableMonths.map((m) => {
        const value = findDataByLabel(companiesMonthlyData, m.label)
        console.log(`Company data for ${m.label}:`, value)
        return value
      }),
      jobs: availableMonths.map(m => {
        console.log(`Job data for ${m.label}:`, m.value)
        return m.value
      }),
      applies: availableMonths.map((m) => {
        const value = findDataByLabel(appliesMonthlyData, m.label)
        console.log(`Apply data for ${m.label}:`, value)
        return value
      })
    }
    
    // Debug: Kiểm tra dữ liệu cuối cùng
    console.log('Final processed data:', data)
    console.log('Users array:', data.users)
    console.log('Companies array:', data.companies)
    console.log('Jobs array:', data.jobs)
    console.log('Applies array:', data.applies)
    
    return { months, data }
  }, [stats])

  // Biểu đồ đường cho 4 tháng gần nhất
  const monthlyComparisonData = {
    labels: getLast4MonthsData.months,
    datasets: [
      {
        label: 'Users',
        data: getLast4MonthsData.data.users,
        borderColor: colors.users.border,
        backgroundColor: colors.users.bg,
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Companies',
        data: getLast4MonthsData.data.companies,
        borderColor: colors.companies.border,
        backgroundColor: colors.companies.bg,
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Jobs',
        data: getLast4MonthsData.data.jobs,
        borderColor: colors.jobs.border,
        backgroundColor: colors.jobs.bg,
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Applies',
        data: getLast4MonthsData.data.applies,
        borderColor: colors.applies.border,
        backgroundColor: colors.applies.bg,
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const monthlyComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `So sánh ${getLast4MonthsData.months.length} tháng gần nhất`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value;
          },
        },
      },
    },
  }


  const cardColors = ['primary', 'info', 'warning', 'danger', 'success', 'secondary']
  return (
    <>
      <CRow className="mb-4">
        {summaryStats.slice(0, 4).map((item, idx) => (
          <CCol xs={12} md={6} lg={3} key={idx}>
            <CCard className={`text-white bg-${cardColors[idx % cardColors.length]} mb-3`}>
              <CCardBody>
                <div className="fs-4 fw-bold">
                  {item.value}{' '}
                  <span
                    className={`fs-6 ms-2 ${
                      item.percent > 0
                        ? 'text-success'
                        : item.percent < 0
                          ? 'text-danger'
                          : 'text-white'
                    }`}
                  >
                    {item.percent > 0 && '↑'}
                    {item.percent < 0 && '↓'}
                    {Math.abs(item.percent).toFixed(1)}%
                  </span>
                </div>
                <div>{item.title}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
      {/* So sánh 4 tháng gần nhất */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="monthly-comparison" className="card-title mb-0">
                So sánh {getLast4MonthsData.months.length} tháng gần nhất
              </h4>
              <div className="small text-body-secondary">Tổng quan hệ thống</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          <CRow>
            <CCol xs={12} lg={8}>
              <CCard className="mb-4">
                <CCardBody style={{ height: '400px' }}>
                  <Line data={monthlyComparisonData} options={monthlyComparisonOptions} />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} lg={4}>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th>Users</th>
                      <th>Companies</th>
                      <th>Jobs</th>
                      <th>Applies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLast4MonthsData.months.map((month, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{month}</td>
                        <td>{getLast4MonthsData.data.users[index] || 0}</td>
                        <td>{getLast4MonthsData.data.companies[index] || 0}</td>
                        <td>{getLast4MonthsData.data.jobs[index] || 0}</td>
                        <td>{getLast4MonthsData.data.applies[index] || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Thống kê tăng trưởng */}
              <div className="mt-4">
                <h6 className="mb-3">Tăng trưởng so với tháng trước</h6>
                {getLast4MonthsData.months.length >= 2 && (
                  <div className="row">
                    {[
                      { label: 'Users', data: getLast4MonthsData.data.users },
                      { label: 'Companies', data: getLast4MonthsData.data.companies },
                      { label: 'Jobs', data: getLast4MonthsData.data.jobs },
                      { label: 'Applies', data: getLast4MonthsData.data.applies }
                    ].map((item, idx) => {
                      const current = item.data[item.data.length - 1] || 0
                      const previous = item.data[item.data.length - 2] || 0
                      const growth = previous > 0 ? ((current - previous) / previous * 100) : 0
                      
                      return (
                        <div key={idx} className="col-6 mb-2">
                          <div className="d-flex justify-content-between">
                            <span className="small">{item.label}:</span>
                            <span className={`small fw-semibold ${
                              growth > 0 ? 'text-success' : growth < 0 ? 'text-danger' : 'text-muted'
                            }`}>
                              {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CCol>
          </CRow>
        </CCardBody>
        {/* <CCardFooter>
          <CRow
            xs={{ cols: 2, gutter: 4 }}
            sm={{ cols: 3 }}
            lg={{ cols: 6 }}
            className="mb-2 text-center"
          >
            {summaryStats.map((item, index) => (
              <CCol key={index}>
                <div className="text-body-secondary small">{item.title}</div>
                <div className="fs-5 fw-semibold">{item.value}</div>
              </CCol>
            ))}
          </CRow>
        </CCardFooter> */}
      </CCard>


      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Phân bố Jobs</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <div className="mb-2 fw-semibold">Theo tỉnh</div>
                  {(stats?.jobsByProvince || []).slice(0, 7).map((p, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-prepend">
                        <span className="text-body-secondary small">{p.label}</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="info" value={100} />
                        <div className="ms-2 small">{p.value}</div>
                      </div>
                    </div>
                  ))}
                </CCol>
                <CCol xs={12} md={6} xl={6}>
                  <div className="mb-2 fw-semibold">Theo lĩnh vực</div>

                  {(stats?.jobsByField || []).slice(0, 7).map((f, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-header">
                        <span>{f.label}</span>
                        <span className="ms-auto fw-semibold">{f.value}</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="warning" value={100} />
                      </div>
                    </div>
                  ))}
                  <div className="mb-5"></div>
                  <div className="mb-2 fw-semibold">Tăng trưởng theo tháng</div>
                  {(stats?.jobsMonthly || []).map((m, index) => (
                    <div className="progress-group" key={index}>
                      <div className="progress-group-header">
                        <span>{m.label}</span>
                        <span className="ms-auto fw-semibold">{m.value} </span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="success" value={100} />
                      </div>
                    </div>
                  ))}
                </CCol>
              </CRow>

              <br />
              {/* Removed demo table */}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
