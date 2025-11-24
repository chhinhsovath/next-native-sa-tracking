import { useEffect, useState } from 'react'

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [apiVersion, setApiVersion] = useState<string>('')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus('online')
        setApiVersion(data.version || '1.0.0')
      })
      .catch(() => setApiStatus('offline'))
  }, [])

  const apiEndpoints = [
    { category: 'Authentication', endpoints: [
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login',
      'POST /api/auth/approve-user - Approve pending user'
    ]},
    { category: 'Profile', endpoints: [
      'GET /api/profile - Get user profile',
      'PUT /api/profile - Update user profile'
    ]},
    { category: 'Attendance', endpoints: [
      'POST /api/attendance/check-in-out - Check in/out'
    ]},
    { category: 'Leave Management', endpoints: [
      'POST /api/leave/request - Submit leave request'
    ]},
    { category: 'Mission', endpoints: [
      'POST /api/mission/request - Submit mission request'
    ]},
    { category: 'Work Plan', endpoints: [
      'GET /api/workplan/manage - Manage work plans',
      'POST /api/workplan/manage - Create work plan'
    ]},
    { category: 'Admin', endpoints: [
      'GET /api/admin/users - Get all users',
      'GET /api/admin/approvals - Get pending approvals',
      'GET /api/admin/reports - Get reports',
      'GET /api/admin/workplan-tracking - Track work plans'
    ]},
    { category: 'Office', endpoints: [
      'GET /api/office/location - Get office locations'
    ]},
    { category: 'Health Check', endpoints: [
      'GET /api/health - API health status'
    ]}
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #1e3a8a, #1e40af)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            PED Attendance System API
          </h1>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: apiStatus === 'online' ? '#10b981' : apiStatus === 'offline' ? '#ef4444' : '#6b7280',
            padding: '0.5rem 1.5rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'white',
              display: 'inline-block',
              animation: apiStatus === 'checking' ? 'pulse 2s infinite' : 'none'
            }} />
            {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'API Online' : 'API Offline'}
          </div>
          {apiVersion && (
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Version {apiVersion}</p>
          )}
        </div>

        {/* Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Welcome to the API Server
          </h2>
          <p style={{ opacity: 0.9, lineHeight: '1.6' }}>
            This is a backend API service for the PED Attendance Mobile Application.
            The API provides endpoints for user authentication, attendance tracking,
            leave management, mission requests, work plan management, and administrative functions.
          </p>
        </div>

        {/* API Endpoints */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Available Endpoints
          </h2>

          {apiEndpoints.map((category, idx) => (
            <div key={idx} style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#93c5fd'
              }}>
                {category.category}
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {category.endpoints.map((endpoint, endpointIdx) => (
                  <li key={endpointIdx} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {endpoint}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '3rem',
          opacity: 0.7,
          fontSize: '0.875rem'
        }}>
          <p>For API documentation and integration details, contact the development team.</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
