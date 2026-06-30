import { Router } from "express";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../addresses/schemas.js";
import { serializeAddress } from "../addresses/serializer.js";
import {
  createAddress,
  deleteAddress,
  getAddressesForUser,
  setDefaultAddress,
  updateAddress,
} from "../addresses/service.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

export const addressesRouter = Router();

addressesRouter.use(requireAuth);

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

addressesRouter.get("/", async (req, res, next) => {
  try {
    const addresses = await getAddressesForUser(req.user!.id);
    res.json({
      success: true,
      data: {
        addresses: addresses.map(serializeAddress),
      },
    });
  } catch (error) {
    next(error);
  }
});

addressesRouter.post("/", validateBody(createAddressSchema), async (req, res, next) => {
  try {
    const address = await createAddress(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      data: serializeAddress(address),
    });
  } catch (error) {
    next(error);
  }
});

addressesRouter.patch(
  "/:id/default",
  async (req, res, next) => {
    try {
      const addressId = getRouteParam(req.params.id);
      const address = await setDefaultAddress(req.user!.id, addressId);

      if (!address) {
        res.status(404).json({
          success: false,
          error: "Address not found",
        });
        return;
      }

      res.json({
        success: true,
        data: serializeAddress(address),
      });
    } catch (error) {
      next(error);
    }
  }
);

addressesRouter.patch(
  "/:id",
  validateBody(updateAddressSchema),
  async (req, res, next) => {
    try {
      const addressId = getRouteParam(req.params.id);
      const address = await updateAddress(req.user!.id, addressId, req.body);

      if (!address) {
        res.status(404).json({
          success: false,
          error: "Address not found",
        });
        return;
      }

      res.json({
        success: true,
        data: serializeAddress(address),
      });
    } catch (error) {
      next(error);
    }
  }
);

addressesRouter.delete("/:id", async (req, res, next) => {
  try {
    const addressId = getRouteParam(req.params.id);
    const address = await deleteAddress(req.user!.id, addressId);

    if (!address) {
      res.status(404).json({
        success: false,
        error: "Address not found",
      });
      return;
    }

    res.json({
      success: true,
      data: serializeAddress(address),
    });
  } catch (error) {
    next(error);
  }
});
