import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get or create agent profile
  let agentProfile = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!agentProfile) {
    // Generate unique referral code
    const referralCode = `AG${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    
    agentProfile = await prisma.agentProfile.create({
      data: {
        userId: session.user.id,
        referralCode,
        commissionRate: 4.0
      }
    })
  }

  // Get or create wallet
  let wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id
      },
      include: {
        transactions: true
      }
    })
  }

  // Get referred properties
  const referredProperties = await prisma.property.findMany({
    where: {
      referredBy: session.user.id,
      paymentStatus: 'paid'
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  })

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/list-property?ref=${agentProfile.referralCode}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Agent Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold text-blue-600">R{wallet.balance.toString()}</p>
          </div>

          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-green-600">R{wallet.totalEarned.toString()}</p>
          </div>

          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
            <p className="text-3xl font-bold text-gray-900">{agentProfile.totalReferrals}</p>
          </div>

          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
            <p className="text-3xl font-bold text-gray-900">{agentProfile.commissionRate.toString()}%</p>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-white p-6 shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
          <p className="text-gray-600 mb-4">
            Share this link with property owners. When they list and pay for their property, you earn {agentProfile.commissionRate.toString()}% commission!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 bg-gray-50 text-gray-900"
            />
            <button
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Copy Link
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Your referral code: <span className="font-mono font-semibold">{agentProfile.referralCode}</span>
          </p>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {wallet.transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold ${
                            transaction.type === 'CREDIT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.description}</td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}R{transaction.amount.toString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        R{transaction.balanceAfter.toString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Referred Properties */}
        <div className="bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Referred Properties</h2>
          {referredProperties.length === 0 ? (
            <p className="text-gray-500">No referred properties yet. Share your referral link to start earning!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Property</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Owner</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date Paid</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Listing Price</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Commission</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referredProperties.map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="py-3 px-4 text-sm text-gray-900">{property.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{property.owner.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {property.paidAt ? new Date(property.paidAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        R{property.listingPrice?.toString() || '0'}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                        R{property.commissionAmount?.toString() || '0'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold ${
                            property.commissionPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {property.commissionPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
