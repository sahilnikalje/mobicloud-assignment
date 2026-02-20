import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { StatCard, Badge, Spinner } from '../../components/index'
import Layout from '../../components/Layout'

const STATUS_COLORS = { new: '#3b82f6', contacted: '#8b5cf6', qualified: '#10b981', unqualified: '#ef4444', converted: '#06b6d4' }
const STAGE_COLORS = { prospect: '#3b82f6', negotiation: '#f59e0b', won: '#10b981', lost: '#ef4444' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ leadStats: [], dealStats: [], recentLeads: [], recentActivities: [] })

  useEffect(() => {
    Promise.all([
      api.get('/leads/stats'),
      api.get('/deals/pipeline'),
      api.get('/leads?limit=5'),
      api.get('/activities?limit=5')
    ]).then(([ls, ds, leads, acts]) => {
      setData({
        leadStats: ls.data.data.map(s => ({ name: s._id, value: s.count })),
        dealStats: ds.data.data.map(s => ({ stage: s._id, count: s.count, value: s.totalValue })),
        recentLeads: leads.data.data,
        recentActivities: acts.data.data
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalLeads = data.leadStats.reduce((s, i) => s + i.value, 0)
  const totalDeals = data.dealStats.reduce((s, i) => s + i.count, 0)
  const totalValue = data.dealStats.reduce((s, i) => s + i.value, 0)
  const wonDeals = data.dealStats.find(d => d.stage === 'won')?.count || 0

  if (loading) return <Layout><Spinner /></Layout>

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your sales overview for today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Leads" value={totalLeads} icon="👥" color="blue" />
          <StatCard label="Total Deals" value={totalDeals} icon="💼" color="purple" />
          <StatCard label="Pipeline Value" value={`$${(totalValue/1000).toFixed(0)}k`} icon="💰" color="yellow" />
          <StatCard label="Won Deals" value={wonDeals} icon="🏆" color="green" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Lead Status</h3>
            {data.leadStats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.leadStats} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {data.leadStats.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {data.leadStats.map(s => (
                    <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: STATUS_COLORS[s.name] || '#94a3b8' }} />
                      {s.name} ({s.value})
                    </span>
                  ))}
                </div>
              </>
            ) : <p className="text-gray-400 text-center py-12">No data yet</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Deal Pipeline</h3>
            {data.dealStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.dealStats} barSize={32}>
                  <XAxis dataKey="stage" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.dealStats.map((e, i) => <Cell key={i} fill={STAGE_COLORS[e.stage] || '#3b82f6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-center py-12">No deals yet</p>}
          </div>
        </div>

        {/* Recent */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Recent Leads</h3>
              <button onClick={() => navigate('/leads')} className="text-sm text-blue-600 hover:underline">View all</button>
            </div>
            {data.recentLeads.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No leads yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentLeads.map(lead => (
                  <div key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.company || lead.email}</div>
                    </div>
                    <Badge label={lead.status} type={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Recent Activities</h3>
              <button onClick={() => navigate('/activities')} className="text-sm text-blue-600 hover:underline">View all</button>
            </div>
            {data.recentActivities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.map(act => (
                  <div key={act._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg">{{ call: '📞', meeting: '📅', note: '📝', follow_up: '🔔' }[act.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{act.title}</div>
                      <div className="text-xs text-gray-500">{act.lead?.name}</div>
                    </div>
                    <Badge label={act.status} type={act.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}