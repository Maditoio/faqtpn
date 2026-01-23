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

  // Get or create default credit rate setting
  let creditSetting = await prisma.systemSettings.findUnique({
    where: { key: 'owner_credit_rate' }
  })

  if (!creditSetting) {
    creditSetting = await prisma.systemSettings.create({
      data: {
        key: 'owner_credit_rate',
        value: '10.0',
        description: 'Percentage of listing price credited back to owner wallet (%)'
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>

        <div className="bg-white p-6 shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Wallet Credit Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure the percentage of listing price that property owners receive as wallet credits when they list properties.
          </p>

          <SettingsForm initialRate={creditSetting.value} />
        </div>

        <div className="bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Statistics</h2>
          {/* Wallet stats will be loaded */}
          <WalletStats />
        </div>
      </div>
    </div>
  )
}

async function WalletStats() {
  const totalWallets = await prisma.wallet.count()
  const totalCredits = await prisma.wallet.aggregate({
    _sum: {
      totalEarned: true
    }
  })

  const topWallets = await prisma.wallet.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      totalEarned: 'desc'
    },
    take: 10
  })

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Wallets</p>
          <p className="text-2xl font-bold text-gray-900">{totalWallets}</p>
        </div>
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Credits Issued</p>
          <p className="text-2xl font-bold text-green-600">
            R{totalCredits._sum.totalEarned?.toString() || '0'}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Wallet Holders</h3>
      {topWallets.length === 0 ? (
        <p className="text-gray-500">No wallets yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Owner</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Balance</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Total Earned</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topWallets.map((wallet) => (
                <tr key={wallet.id} className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-900">{wallet.user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{wallet.user.email}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600 text-right">
                    R{wallet.balance.toString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600 text-right">
                    R{wallet.totalEarned.toString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    R{wallet.totalSpent.toString()}
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
