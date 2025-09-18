const express = require("express");
const { body, validationResult } = require("express-validator");
const { User, Address } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Get current user - simple and clean
router.get("/me", authenticate, async (req, res) => {
  try {
    // TODO: maybe cache this later if it gets called too often
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Address, as: "addresses" }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// Update user profile - with some custom validation logic
router.put(
  "/me",
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name too short"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name too short"),
    body("phone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid phone format"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email"),
  ],
  authenticate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, phone, email } = req.body;
      const updateData = {};

      // Build update object only with provided fields
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;

      // Special handling for email - check uniqueness
      if (email) {
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [require("sequelize").Op.ne]: req.user.id },
          },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }
        updateData.email = email;
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update",
        });
      }

      await req.user.update(updateData);

      res.json({
        success: true,
        message: "Profile updated",
        data: { user: req.user.toJSON() },
      });
    } catch (error) {
      console.error("Profile update failed:", error);
      res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }
  }
);

// Password change endpoint
router.post(
  "/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password too short (min 6 chars)"),
  ],
  authenticate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid input",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Check if new password is different
      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current",
        });
      }

      // Verify current password
      const isValid = await req.user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Current password incorrect",
        });
      }

      // Update password
      await req.user.update({ password: newPassword });

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        message: "Password change failed",
      });
    }
  }
);

// Get user addresses - defaults first, then by creation date
router.get("/addresses", authenticate, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [
        ["isDefault", "DESC"], // Default addresses first
        ["createdAt", "DESC"], // Then newest first
      ],
    });

    res.json({
      success: true,
      data: { addresses },
    });
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch addresses",
    });
  }
});

// Add new address with smart default handling
router.post(
  "/addresses",
  [
    body("type")
      .isIn(["billing", "shipping"])
      .withMessage("Must be billing or shipping"),
    body("firstName").trim().notEmpty().withMessage("First name required"),
    body("lastName").trim().notEmpty().withMessage("Last name required"),
    body("address1").trim().notEmpty().withMessage("Address required"),
    body("city").trim().notEmpty().withMessage("City required"),
    body("state").trim().notEmpty().withMessage("State required"),
    body("postalCode").trim().notEmpty().withMessage("Postal code required"),
    body("country").trim().notEmpty().withMessage("Country required"),
  ],
  authenticate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const addressData = {
        ...req.body,
        userId: req.user.id,
      };

      // Handle default address logic
      if (addressData.isDefault) {
        // Unset other defaults of the same type
        await Address.update(
          { isDefault: false },
          {
            where: {
              userId: req.user.id,
              type: addressData.type,
            },
          }
        );
      }

      const address = await Address.create(addressData);

      res.status(201).json({
        success: true,
        message: "Address created",
        data: { address },
      });
    } catch (error) {
      console.error("Address creation failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create address",
      });
    }
  }
);

// Update address - with ownership check
router.put(
  "/addresses/:id",
  [
    body("type").optional().isIn(["billing", "shipping"]),
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("address1").optional().trim().notEmpty(),
    body("city").optional().trim().notEmpty(),
    body("state").optional().trim().notEmpty(),
    body("postalCode").optional().trim().notEmpty(),
    body("country").optional().trim().notEmpty(),
  ],
  authenticate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Find address and verify ownership
      const address = await Address.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      // Handle default address switching
      if (req.body.isDefault && req.body.isDefault !== address.isDefault) {
        await Address.update(
          { isDefault: false },
          {
            where: {
              userId: req.user.id,
              type: address.type,
              id: { [require("sequelize").Op.ne]: address.id },
            },
          }
        );
      }

      await address.update(req.body);

      res.json({
        success: true,
        message: "Address updated",
        data: { address },
      });
    } catch (error) {
      console.error("Address update failed:", error);
      res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }
  }
);

// Delete address - simple and clean
router.delete("/addresses/:id", authenticate, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await address.destroy();

    res.json({
      success: true,
      message: "Address deleted",
    });
  } catch (error) {
    console.error("Address deletion failed:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

module.exports = router;
