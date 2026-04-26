'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { insertReviewSchema } from '../validators';
import { defaultErrorRes } from './utils';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

// Create & update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>,
) {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    // Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    // Get product that is being reviewed

    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    });

    if (!product) throw new Error('Product not found');

    // Check if user has already reviewed the product
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // Update existing review
        await tx.review.update({
          where: {
            id: reviewExists.id,
          },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create new review
        await tx.review.create({
          data: review,
        });
      }

      // Get average rating
      const avgRating = await tx.review.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          productId: review.productId,
        },
      });

      // Get number of reviews
      const numReviews = await tx.review.count({
        where: {
          productId: review.productId,
        },
      });

      // Update product with new average rating and number of reviews
      await tx.product.update({
        where: {
          id: review.productId,
        },
        data: {
          rating: avgRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: reviewExists
        ? 'Review updated successfully'
        : 'Review created successfully',
    };
  } catch (error) {
    return defaultErrorRes(error);
  }
}

// Get reviews for a product
export async function getReviewsForProduct({
  productId,
}: {
  productId: string;
}) {
  const data = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { data };
}

// Get a review written by the current user
export async function getUserReviewForProduct({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();
  if (!session) throw new Error('User is not authenticated');

  const review = await prisma.review.findFirst({
    where: {
      productId,
      userId: session.user.id,
    },
  });

  return { data: review };
}
