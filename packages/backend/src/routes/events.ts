import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import AWS from 'aws-sdk';

const router = Router();
const prisma = new PrismaClient();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

const eventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  category: z.string(),
  externalLink: z.string().url().optional(),
  recurrence: z
    .object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
      interval: z.number().min(1),
      endDate: z.string().datetime().optional(),
    })
    .optional(),
});

// Create event
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'EVENT_CREATOR'),
  upload.array('images', 5),
  async (req, res, next) => {
    try {
      const eventData = eventSchema.parse(req.body);
      const files = req.files as Express.Multer.File[];

      // Upload images to S3
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          const params = {
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: `events/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
          };

          const result = await s3.upload(params).promise();
          return result.Location;
        })
      );

      const event = await prisma.event.create({
        data: {
          ...eventData,
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          images: imageUrls,
          cityId: req.user!.cityId,
          creatorId: req.user!.id,
          status: req.user!.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        },
      });

      res.status(201).json({
        status: 'success',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get events for a city
router.get('/', async (req, res, next) => {
  try {
    const { cityId, category, status, startDate, endDate, search } = req.query;

    const where: any = {
      cityId: cityId as string,
      ...(category && { category: category as string }),
      ...(status && { status: status as string }),
      ...(startDate && {
        startTime: {
          gte: new Date(startDate as string),
        },
      }),
      ...(endDate && {
        endTime: {
          lte: new Date(endDate as string),
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    };

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    res.json({
      status: 'success',
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// Update event status (approve/reject)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = z
        .object({
          status: z.enum(['APPROVED', 'REJECTED']),
        })
        .parse(req.body);

      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new AppError(404, 'Event not found');
      }

      if (event.cityId !== req.user!.cityId) {
        throw new AppError(403, 'Not authorized to modify this event');
      }

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: { status },
      });

      res.json({
        status: 'success',
        data: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Flag event
router.post('/:id/flag', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = z
      .object({
        reason: z.string().min(10),
      })
      .parse(req.body);

    const event = await prisma.event.update({
      where: { id },
      data: {
        status: 'FLAGGED',
      },
    });

    // TODO: Implement notification system for admins

    res.json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

export const eventRouter = router; 