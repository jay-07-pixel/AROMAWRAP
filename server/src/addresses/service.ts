import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateAddressInput, UpdateAddressInput } from "./schemas.js";

type PrismaTx = Prisma.TransactionClient;

export async function getAddressesForUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function findAddressForUser(userId: string, addressId: string) {
  return prisma.address.findFirst({
    where: { id: addressId, userId },
  });
}

async function clearDefaultAddresses(userId: string, tx: PrismaTx) {
  await tx.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.address.count({ where: { userId } });
    const shouldBeDefault = input.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await clearDefaultAddresses(userId, tx);
    }

    return tx.address.create({
      data: {
        userId,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        country: input.country ?? "India",
        isDefault: shouldBeDefault,
      },
    });
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: UpdateAddressInput
) {
  const existing = await findAddressForUser(userId, addressId);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await clearDefaultAddresses(userId, tx);
    }

    return tx.address.update({
      where: { id: addressId },
      data: input,
    });
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await findAddressForUser(userId, addressId);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const nextDefault = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextDefault) {
        await tx.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return existing;
  });
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const existing = await findAddressForUser(userId, addressId);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    await clearDefaultAddresses(userId, tx);

    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });
}
