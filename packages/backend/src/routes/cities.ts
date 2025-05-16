import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import AWS from 'aws-sdk';
import { generateSlug } from '@event-platform/shared';

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
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const citySchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(3),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    font: z.string(),
    footerText: z.string(),
  }),
  subscriptionTier: z.enum(['STARTER', 'PRO', 'PREMIER']),
});

// Create city
router.post('/', async (req, res, next) => {
  try {
    const cityData = citySchema.parse(req.body);
    const slug = generateSlug(cityData.name);

    const existingCity = await prisma.city.findFirst({
      where: {
        OR: [
          { domain: cityData.domain },
          { slug },
        ],
      },
    });

    if (existingCity) {
      throw new AppError(400, 'City with this domain or name already exists');
    }

    const city = await prisma.city.create({
      data: {
        ...cityData,
        slug,
      },
    });

    res.status(201).json({
      status: 'success',
      data: city,
    });
  } catch (error) {
    next(error);
  }
});

// Update city branding
router.patch(
  '/:id/branding',
  authenticate,
  authorize('ADMIN'),
  upload.single('logo'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const brandingData = z.object({
        primaryColor: z.string(),
        secondaryColor: z.string(),
        font: z.string(),
        footerText: z.string(),
      }).parse(req.body);

      const city = await prisma.city.findUnique({
        where: { id },
      });

      if (!city) {
        throw new AppError(404, 'City not found');
      }

      if (city.id !== req.user!.cityId) {
        throw new AppError(403, 'Not authorized to modify this city');
      }

      let logoUrl = city.branding.logo;

      if (file) {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: `cities/${city.id}/logo-${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        const result = await s3.upload(params).promise();
        logoUrl = result.Location;
      }

      const updatedCity = await prisma.city.update({
        where: { id },
        data: {
          branding: {
            ...brandingData,
            logo: logoUrl,
          },
        },
      });

      res.json({
        status: 'success',
        data: updatedCity,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get city by domain
router.get('/domain/:domain', async (req, res, next) => {
  try {
    const { domain } = req.params;

    const city = await prisma.city.findUnique({
      where: { domain },
    });

    if (!city) {
      throw new AppError(404, 'City not found');
    }

    res.json({
      status: 'success',
      data: city,
    });
  } catch (error) {
    next(error);
  }
});

// Get city analytics
router.get(
  '/:id/analytics',
  authenticate,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      }).parse(req.query);

      if (id !== req.user!.cityId) {
        throw new AppError(403, 'Not authorized to view this city\'s analytics');
      }

      const [totalEvents, approvedEvents, rejectedEvents, flaggedEvents] = await Promise.all([
        prisma.event.count({
          where: {
            cityId: id,
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
        prisma.event.count({
          where: {
            cityId: id,
            status: 'APPROVED',
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
        prisma.event.count({
          where: {
            cityId: id,
            status: 'REJECTED',
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
        prisma.event.count({
          where: {
            cityId: id,
            status: 'FLAGGED',
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
      ]);

      res.json({
        status: 'success',
        data: {
          totalEvents,
          approvedEvents,
          rejectedEvents,
          flaggedEvents,
          period: {
            start: startDate,
            end: endDate,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const cityRouter = router; 