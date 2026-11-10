import type { Prisma } from "@prisma/client";

const ORDER_NUMBER_PREFIX = "AW-";
const ORDER_NUMBER_START = 1001;

function formatOrderNumber(sequence: number): string {
  return `${ORDER_NUMBER_PREFIX}${sequence}`;
}

/** Allocate the next human-readable order number (AW-1001, AW-1002, ...). */
export async function allocateOrderNumber(
  tx: Prisma.TransactionClient
): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ maxSeq: bigint | number | null }>>`
    SELECT MAX(CAST(SUBSTRING(orderNumber, 4) AS UNSIGNED)) AS maxSeq
    FROM \`Order\`
    WHERE orderNumber LIKE 'AW-%'
  `;

  const rawMax = rows[0]?.maxSeq;
  const maxSeq =
    rawMax == null ? ORDER_NUMBER_START - 1 : Number(rawMax);
  let next = Math.max(ORDER_NUMBER_START, maxSeq + 1);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = formatOrderNumber(next + attempt);
    const exists = await tx.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return formatOrderNumber(ORDER_NUMBER_START + (Date.now() % 100000));
}
