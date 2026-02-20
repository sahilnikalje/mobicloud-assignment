// Badge component
export const Badge = ({ label, type }) => {
  const colors = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-purple-100 text-purple-700',
    qualified: 'bg-green-100 text-green-700',
    unqualified: 'bg-red-100 text-red-700',
    converted: 'bg-emerald-100 text-emerald-700',
    prospect: 'bg-blue-100 text-blue-700',
    negotiation: 'bg-yellow-100 text-yellow-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
    call: 'bg-blue-100 text-blue-700',
    meeting: 'bg-purple-100 text-purple-700',
    note: 'bg-yellow-100 text-yellow-700',
    follow_up: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    admin: 'bg-purple-100 text-purple-700',
    sales: 'bg-blue-100 text-blue-700',
  }
  const cls = colors[type] || colors[label?.toLowerCase()] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {label?.replace(/_/g, ' ')}
    </span>
  )
}

// Button component
export const Button = ({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) => {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all cursor-pointer disabled:opacity-60'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
    success: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
}

// Input component
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
)

// Select component
export const Select = ({ label, options = [], placeholder, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select
      className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${error ? 'border-red-400' : 'border-gray-300'}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
)

// Textarea component
export const Textarea = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${error ? 'border-red-400' : 'border-gray-300'}`}
      rows={3}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
)

// Modal component
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Spinner component
export const Spinner = () => (
  <div className="flex justify-center items-center py-16">
    <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>
)

// Empty state
export const EmptyState = ({ title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="text-4xl">📭</div>
    <h3 className="text-gray-600 font-medium">{title}</h3>
    {message && <p className="text-gray-400 text-sm">{message}</p>}
    {action}
  </div>
)

// Stat card
export const StatCard = ({ label, value, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className={`text-xl p-2 rounded-lg ${colors[color]}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  )
}

// Pagination
export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>←</Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {p}
        </button>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === pages}>→</Button>
    </div>
  )
}