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

  const jobStats = [
    {
      title: '💼Jobs Active',
      value: stats?.totals?.jobsActive ?? 0,
      color: 'success',
      icon: 'cilCheckCircle'
    },
    {
      title: '⏰Jobs Expired',
      value: stats?.totals?.jobsExpired ?? 0,
      color: 'danger',
      icon: 'cilXCircle'
    },
    {
      title: '⚠️Expiring Soon',
      value: stats?.totals?.jobsExpiringSoon ?? 0,
      color: 'warning',
      icon: 'cilClock'
    }
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
  
  // Biểu đồ theo ngày (7 ngày gần nhất)
  const generateLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    return days;
  };

  const last7Days = generateLast7Days();
  
  const getDailyData = (data, type) => {
    const dataMap = {};
    (data || []).forEach(item => {
      dataMap[item.label] = item.value;
    });
    
    return last7Days.map(day => dataMap[day] || 0);
  };

  const dailyData = {
    labels: last7Days.map(day => dayjs(day).format('DD/MM')),
    datasets: [
      {
        label: '💼 Jobs',
        data: getDailyData(stats?.jobsDaily, 'jobs'),
        borderColor: colors.jobs.border,
        backgroundColor: colors.jobs.bg,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: colors.jobs.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: '👤 Users',
        data: getDailyData(stats?.usersDaily, 'users'),
        borderColor: colors.users.border,
        backgroundColor: colors.users.bg,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: colors.users.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: '🏢 Companies',
        data: getDailyData(stats?.companiesDaily, 'companies'),
        borderColor: colors.companies.border,
        backgroundColor: colors.companies.bg,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: colors.companies.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  }

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: '📊 Thống kê hoạt động 7 ngày gần nhất',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#2c3e50'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return dayjs(context[0].label, 'DD/MM').format('dddd, DD/MM/YYYY');
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} ${context.parsed.y === 1 ? 'mục' : 'mục'}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  }

  return (
    <>
      {/* Thống kê tổng quan */}
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

      {/* Thống kê Jobs chi tiết */}
      <CRow className="mb-4">
        {jobStats.map((item, idx) => (
          <CCol xs={12} md={4} key={idx}>
            <CCard className={`text-white bg-${item.color} mb-3`}>
              <CCardBody>
                <div className="fs-4 fw-bold">{item.value}</div>
                <div>{item.title}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Cảnh báo Jobs sắp hết hạn */}
      {stats?.expiringJobsList && stats.expiringJobsList.length > 0 && (
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="border-warning">
              <CCardHeader className="bg-warning text-dark">
                <h5 className="mb-0">⚠️ Cảnh báo: Jobs sắp hết hạn</h5>
              </CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Deadline</th>
                        <th>Days Left</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.expiringJobsList.map((job, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{job.nameJob}</td>
                          <td>{job.nameCompany}</td>
                          <td>{dayjs(job.deadline).format('DD/MM/YYYY')}</td>
                          <td>
                            <span className={`badge ${
                              job.daysLeft <= 1 ? 'bg-danger' : 
                              job.daysLeft <= 3 ? 'bg-warning' : 'bg-info'
                            }`}>
                              {job.daysLeft} ngày
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              job.daysLeft <= 1 ? 'bg-danger' : 
                              job.daysLeft <= 3 ? 'bg-warning' : 'bg-success'
                            }`}>
                              {job.daysLeft <= 1 ? 'Khẩn cấp' : 
                               job.daysLeft <= 3 ? 'Cảnh báo' : 'Bình thường'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Biểu đồ theo ngày */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📊 Thống kê theo ngày (7 ngày gần nhất)</h5>
                <div className="d-flex gap-3">
                  <div className="text-center">
                    <div className="h6 mb-0 text-primary">
                      {getDailyData(stats?.jobsDaily, 'jobs').reduce((a, b) => a + b, 0)}
                    </div>
                    <small className="text-muted">Tổng Jobs</small>
                  </div>
                  <div className="text-center">
                    <div className="h6 mb-0 text-info">
                      {getDailyData(stats?.usersDaily, 'users').reduce((a, b) => a + b, 0)}
                    </div>
                    <small className="text-muted">Tổng Users</small>
                  </div>
                  <div className="text-center">
                    <div className="h6 mb-0 text-warning">
                      {getDailyData(stats?.companiesDaily, 'companies').reduce((a, b) => a + b, 0)}
                    </div>
                    <small className="text-muted">Tổng Companies</small>
                  </div>
                </div>
              </div>
            </CCardHeader>
            <CCardBody style={{ height: '450px' }}>
              <Line data={dailyData} options={dailyOptions} />
            </CCardBody>
            <CCardFooter>
              <div className="row text-center">
                <div className="col-4">
                  <small className="text-muted">
                    <strong>Ngày có nhiều Jobs nhất:</strong><br/>
                    {(() => {
                      const jobsData = getDailyData(stats?.jobsDaily, 'jobs');
                      const maxIndex = jobsData.indexOf(Math.max(...jobsData));
                      return jobsData[maxIndex] > 0 ? last7Days[maxIndex] : 'Chưa có dữ liệu';
                    })()}
                  </small>
                </div>
                <div className="col-4">
                  <small className="text-muted">
                    <strong>Ngày có nhiều Users nhất:</strong><br/>
                    {(() => {
                      const usersData = getDailyData(stats?.usersDaily, 'users');
                      const maxIndex = usersData.indexOf(Math.max(...usersData));
                      return usersData[maxIndex] > 0 ? last7Days[maxIndex] : 'Chưa có dữ liệu';
                    })()}
                  </small>
                </div>
                <div className="col-4">
                  <small className="text-muted">
                    <strong>Ngày có nhiều Companies nhất:</strong><br/>
                    {(() => {
                      const companiesData = getDailyData(stats?.companiesDaily, 'companies');
                      const maxIndex = companiesData.indexOf(Math.max(...companiesData));
                      return companiesData[maxIndex] > 0 ? last7Days[maxIndex] : 'Chưa có dữ liệu';
                    })()}
                  </small>
                </div>
              </div>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>

      {/* Bảng thống kê chi tiết theo ngày */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">📋 Chi tiết hoạt động 7 ngày gần nhất</h5>
            </CCardHeader>
            <CCardBody>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Ngày</th>
                      <th className="text-center">💼 Jobs</th>
                      <th className="text-center">👤 Users</th>
                      <th className="text-center">🏢 Companies</th>
                      <th className="text-center">📊 Tổng cộng</th>
                      <th className="text-center">📈 Tăng trưởng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {last7Days.map((day, index) => {
                      const jobsCount = getDailyData(stats?.jobsDaily, 'jobs')[index];
                      const usersCount = getDailyData(stats?.usersDaily, 'users')[index];
                      const companiesCount = getDailyData(stats?.companiesDaily, 'companies')[index];
                      const total = jobsCount + usersCount + companiesCount;
                      
                      const prevJobsCount = index > 0 ? getDailyData(stats?.jobsDaily, 'jobs')[index - 1] : 0;
                      const prevUsersCount = index > 0 ? getDailyData(stats?.usersDaily, 'users')[index - 1] : 0;
                      const prevCompaniesCount = index > 0 ? getDailyData(stats?.companiesDaily, 'companies')[index - 1] : 0;
                      const prevTotal = prevJobsCount + prevUsersCount + prevCompaniesCount;
                      
                      const growth = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100).toFixed(1) : 0;
                      
                      return (
                        <tr key={day}>
                          <td>
                            <div>
                              <strong>{dayjs(day).format('dddd')}</strong><br/>
                              <small className="text-muted">{dayjs(day).format('DD/MM/YYYY')}</small>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${jobsCount > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                              {jobsCount}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${usersCount > 0 ? 'bg-info' : 'bg-secondary'}`}>
                              {usersCount}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${companiesCount > 0 ? 'bg-warning' : 'bg-secondary'}`}>
                              {companiesCount}
                            </span>
                          </td>
                          <td className="text-center">
                            <strong className={total > 0 ? 'text-success' : 'text-muted'}>
                              {total}
                            </strong>
                          </td>
                          <td className="text-center">
                            {index > 0 && (
                              <span className={`badge ${growth > 0 ? 'bg-success' : growth < 0 ? 'bg-danger' : 'bg-secondary'}`}>
                                {growth > 0 ? '+' : ''}{growth}%
                              </span>
                            )}
                            {index === 0 && <span className="text-muted">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Tổng cộng</th>
                      <th className="text-center">
                        <span className="badge bg-primary">
                          {getDailyData(stats?.jobsDaily, 'jobs').reduce((a, b) => a + b, 0)}
                        </span>
                      </th>
                      <th className="text-center">
                        <span className="badge bg-info">
                          {getDailyData(stats?.usersDaily, 'users').reduce((a, b) => a + b, 0)}
                        </span>
                      </th>
                      <th className="text-center">
                        <span className="badge bg-warning">
                          {getDailyData(stats?.companiesDaily, 'companies').reduce((a, b) => a + b, 0)}
                        </span>
                      </th>
                      <th className="text-center">
                        <strong className="text-success">
                          {getDailyData(stats?.jobsDaily, 'jobs').reduce((a, b) => a + b, 0) + 
                           getDailyData(stats?.usersDaily, 'users').reduce((a, b) => a + b, 0) + 
                           getDailyData(stats?.companiesDaily, 'companies').reduce((a, b) => a + b, 0)}
                        </strong>
                      </th>
                      <th className="text-center">-</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Biểu đồ Pie Chart cho top ngành */}
      <CRow className="mb-4">
        <CCol xs={12} md={6}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">🥇 Top 5 ngành được đăng nhiều nhất</h5>
            </CCardHeader>
            <CCardBody style={{ height: '400px' }}>
              <Pie 
                data={{
                  labels: (stats?.jobsByField || []).slice(0, 5).map(item => item.label),
                  datasets: [{
                    data: (stats?.jobsByField || []).slice(0, 5).map(item => item.value),
                    backgroundColor: [
                      'rgba(75, 192, 192, 0.8)',
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(153, 102, 255, 0.8)',
                    ],
                    borderColor: [
                      'rgba(75, 192, 192, 1)',
                      'rgba(255, 99, 132, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Phân bố jobs theo ngành'
                    }
                  }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">📍 Top 5 tỉnh có nhiều jobs nhất</h5>
            </CCardHeader>
            <CCardBody style={{ height: '400px' }}>
              <Bar 
                data={{
                  labels: (stats?.jobsByProvince || []).slice(0, 5).map(item => item.label),
                  datasets: [{
                    label: 'Số lượng jobs',
                    data: (stats?.jobsByProvince || []).slice(0, 5).map(item => item.value),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: true,
                      text: 'Phân bố jobs theo tỉnh'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
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
                  <div className="mb-2 fw-semibold">Top ngành được đăng nhiều nhất</div>

                  {(stats?.jobsByField || []).slice(0, 7).map((f, index) => {
                    const maxValue = Math.max(...(stats?.jobsByField || []).map(item => item.value))
                    const percentage = maxValue > 0 ? (f.value / maxValue) * 100 : 0
                    return (
                      <div className="progress-group mb-4" key={index}>
                        <div className="progress-group-header">
                          <span className="fw-semibold">{f.label}</span>
                          <span className="ms-auto fw-semibold text-primary">{f.value} jobs</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress 
                            thin 
                            color={index < 3 ? "success" : index < 5 ? "warning" : "info"} 
                            value={percentage}
                            className="mb-1"
                          />
                          <div className="small text-muted">
                            {percentage.toFixed(1)}% của ngành cao nhất
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
