import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import cacheManager, { CacheKeys, invalidateCache } from '@/lib/cache'

/**
 * DELETE /api/favorites/[id]
 * Remove a property from favorites
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find and delete favorite
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: id,
        },
      },
    })

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    })

    // Invalidate caches
    invalidateCache.user(user.id)
    cacheManager.del(CacheKeys.propertyFavorites(id))

    return NextResponse.json({ message: 'Property removed from favorites' })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
