import type { Prisma } from "@prisma/client";

const ORDER_NUMBER_PREFIX = "AW-";
const ORDER_NUMBER_START = 1001;

function formatOrderNumber(sequence: number): string {
  return `${ORDER_NUMBER_PREFIX}${sequence}`;
}

/**
 * Allocate the next human-readable order number (AW-1001, AW-1002, ...).
 * Paired with a unique-constraint retry in createOrderFromCart so concurrent
 * checkouts never fail with a duplicate orderNumber collision.
 */
export async function allocateOrderNumber(
  tx: Prisma.TransactionClient,
  offset = 0
): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ maxSeq: bigint | number | null }>>`
    SELECT MAX(CAST(SUBSTRING(orderNumber, 4) AS UNSIGNED)) AS maxSeq
    FROM \`Order\`
    WHERE orderNumber LIKE 'AW-%'
    FOR UPDATE
  `;

  const rawMax = rows[0]?.maxSeq;
  const maxSeq =
    rawMax == null ? ORDER_NUMBER_START - 1 : Number(rawMax);
  const next = Math.max(ORDER_NUMBER_START, maxSeq + 1) + offset;

  return formatOrderNumber(next);
}
