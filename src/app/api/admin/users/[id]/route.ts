import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import { userUpdateSchema } from '@/lib/validations'

/**
 * PATCH /api/admin/users/[id]
 * Update user (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    
    // Validate input
    const validationResult = userUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: validationResult.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log admin action
    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        userId: user.id,
        performedBy: user.id,
        targetId: params.id,
        details: `User updated: ${updatedUser.email}`,
      },
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: params.id },
    })

    // Log admin action
    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETED',
        userId: user.id,
        performedBy: user.id,
        targetId: params.id,
        details: `User deleted: ${targetUser.email}`,
      },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
