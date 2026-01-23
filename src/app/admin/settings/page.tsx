import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { SettingsForm } from './SettingsForm'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
    redirect('/auth/signin')
  }

  // Get or create default commission rate setting
  let commissionSetting = await prisma.systemSettings.findUnique({
    where: { key: 'agent_commission_rate' }
  })

  if (!commissionSetting) {
    commissionSetting = await prisma.systemSettings.create({
      data: {
        key: 'agent_commission_rate',
        value: '4.0',
        description: 'Default commission rate (%) for agent referrals'
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>

        <div className="bg-white p-6 shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Commission Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure the default commission rate for agent referrals. This rate will be applied to new agents.
          </p>

          <SettingsForm initialRate={commissionSetting.value} />
        </div>

        <div className="bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Statistics</h2>
          {/* Agent stats will be loaded client-side */}
          <AgentStats />
        </div>
      </div>
    </div>
  )
}

async function AgentStats() {
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      totalEarnings: 'desc'
    },
    take: 10
  })

  const totalAgents = await prisma.agentProfile.count()
  const totalCommissions = await prisma.agentProfile.aggregate({
    _sum: {
      totalEarnings: true
    }
  })

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Agents</p>
          <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
        </div>
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Commissions Paid</p>
          <p className="text-2xl font-bold text-green-600">
            R{totalCommissions._sum.totalEarnings?.toString() || '0'}
          </p>
        </div>
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Referrals</p>
          <p className="text-2xl font-bold text-gray-900">
            {agents.reduce((sum, a) => sum + a.totalReferrals, 0)}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Performing Agents</h3>
      {agents.length === 0 ? (
        <p className="text-gray-500">No agents registered yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Agent</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Referrals</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Earnings</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Rate</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-900">{agent.user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{agent.user.email}</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-900">{agent.totalReferrals}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                    R{agent.totalEarnings.toString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-gray-900">
                    {agent.commissionRate.toString()}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold ${
                        agent.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
