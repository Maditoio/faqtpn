import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

export default async function WalletDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get or create wallet for user
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

  // Get user's properties that earned credits
  const propertiesWithCredits = await prisma.property.findMany({
    where: {
      ownerId: session.user.id,
      paymentStatus: 'paid',
      commissionAmount: { not: null }
    },
    orderBy: { paidAt: 'desc' },
    take: 10
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold text-blue-600">R{wallet.balance.toString()}</p>
          </div>

          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-green-600">R{wallet.totalEarned.toString()}</p>
          </div>

          <div className="bg-white p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">R{wallet.totalSpent.toString()}</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 p-6 shadow mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">How Wallet Credits Work</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You earn credits automatically when you list properties on our platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Credits are added to your wallet when you pay for a listing plan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use your wallet balance to pay for future property listings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Check your transaction history below to see all wallet activity</span>
            </li>
          </ul>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {wallet.transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet. Start listing properties to earn credits!</p>
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

        {/* Properties with Credits */}
        {propertiesWithCredits.length > 0 && (
          <div className="bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Properties That Earned Credits</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Property</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date Paid</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Listing Price</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Credits Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {propertiesWithCredits.map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="py-3 px-4 text-sm text-gray-900">{property.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {property.paidAt ? new Date(property.paidAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        R{property.listingPrice?.toString() || '0'}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                        R{property.commissionAmount?.toString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
