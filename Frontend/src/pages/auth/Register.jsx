import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import { Input, Select, Button } from '../../components/index'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name required'
    if (!form.email) e.email = 'Email required'
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">S</div>
          <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Get started with Sales CRM</p>
        </div>

        {errors.server && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">{errors.server}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Enter name here" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email" type="email" placeholder="Enter email here" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} error={errors.password} />
          <Select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
            options={[{ value: 'sales', label: 'Sales User' }, { value: 'admin', label: 'Admin' }]} />
          <Button type="submit" loading={loading} className="w-full justify-center">Create Account</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}