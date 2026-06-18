import RequestForm from '../components/RequestForm'
import RequestTracker from '../components/RequestTracker'

const theme = {
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  surfaceColor: '#f9fafb',
  borderColor: '#e5e7eb',
  textColor: '#111827',
  mutedTextColor: '#6b7280',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '12px'
}

const mockContext = {
  appId: '9e3a1c59-c66c-47fb-8932-75f7724eaced',
  clientId: 'b9ec008b-22df-4b98-b1d9-59bc1e84ce34',
  locationId: null,
  userId: null,
  appName: 'TIPConnect',
  clientName: 'Acme Corp'
}

export default function FormPreview() {
  function handleSubmit(payload) {
    console.log('Submitted payload:', payload)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-10 py-10">
      <h1 className="text-2xl font-bold text-gray-700">Phase 2 Preview</h1>
      <div className="flex flex-wrap gap-8 justify-center items-start">
        <div>
          <p className="text-center text-sm text-gray-500 mb-2">Request Form</p>
          <RequestForm
            theme={theme}
            context={mockContext}
            onSubmit={handleSubmit}
          />
        </div>
        <div>
          <p className="text-center text-sm text-gray-500 mb-2">Request Tracker</p>
          <RequestTracker
            theme={theme}
            context={mockContext}
          />
        </div>
      </div>
    </div>
  )
}