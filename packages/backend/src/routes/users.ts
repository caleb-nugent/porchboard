import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cityId: true,
        city: {
          select: {
            name: true,
            domain: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update current user
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = updateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updates: any = {};

    if (name) {
      updates.name = name;
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError(400, 'Email already in use');
      }

      updates.email = email;
    }

    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        throw new AppError(401, 'Current password is incorrect');
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cityId: true,
      },
    });

    res.json({
      status: 'success',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Get users for a city (admin only)
router.get(
  '/city/:cityId',
  authenticate,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const { cityId } = req.params;

      if (cityId !== req.user!.cityId) {
        throw new AppError(403, 'Not authorized to view users from this city');
      }

      const users = await prisma.user.findMany({
        where: { cityId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update user role (admin only)
router.patch(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = z
        .object({
          role: z.enum(['ADMIN', 'EVENT_CREATOR']),
        })
        .parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (user.cityId !== req.user!.cityId) {
        throw new AppError(403, 'Not authorized to modify users from this city');
      }

      if (user.id === req.user!.id) {
        throw new AppError(400, 'Cannot modify your own role');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      res.json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const userRouter = router; 