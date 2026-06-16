import RequestForm from '../components/RequestForm'

const themes = {
  default: {},
  dark: {
    primaryColor: '#6366f1',
    backgroundColor: '#1e1e2e',
    surfaceColor: '#2a2a3d',
    borderColor: '#3f3f5c',
    textColor: '#e2e8f0',
    mutedTextColor: '#94a3b8',
  },
  green: {
    primaryColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    surfaceColor: '#dcfce7',
    borderColor: '#bbf7d0',
    textColor: '#14532d',
    mutedTextColor: '#166534',
  }
}

export default function FormPreview() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-10 py-10">
      <h1 className="text-2xl font-bold text-gray-700">Form Theme Preview</h1>
      <div className="flex flex-wrap gap-8 justify-center">
        {Object.entries(themes).map(([name, theme]) => (
          <div key={name}>
            <p className="text-center text-sm text-gray-500 mb-2 capitalize">{name} theme</p>
            <RequestForm
              theme={theme}
              onSubmit={(data) => console.log(`${name} form submitted:`, data)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}