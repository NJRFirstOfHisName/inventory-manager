const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Platform = require("../models/platform");
const Game = require("../models/game");

// Display list of all Platform.
exports.platform_list = asyncHandler(async (req, res, next) => {
  const allPlatforms = await Platform.find().sort({ name: 1 }).exec();
  res.render("platform_list", {
    title: "Platform List",
    platform_list: allPlatforms,
  });
});

// Display detail page for a specific Platform.
exports.platform_detail = asyncHandler(async (req, res, next) => {
  // Get details of platform and all associated games (in parallel)
  const [platform, gamesInPlatform] = await Promise.all([
    Platform.findById(req.params.id).exec(),
    Game.find({ platform: req.params.id }, "title summary").exec(),
  ]);
  if (platform === null) {
    // No results.
    const err = new Error("Platform not found");
    err.status = 404;
    return next(err);
  }

  res.render("platform_detail", {
    title: "Platform Detail",
    platform,
    platform_games: gamesInPlatform,
  });
});

// Display Platform create form on GET.
exports.platform_create_get = (req, res, next) => {
  res.render("platform_form", { title: "Create Platform" });
};

// Handle Platform create on POST.
exports.platform_create_post = [
  // Validate and sanitize the name field.
  body("name", "Platform name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("company", "Company must not be empty")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a platform object with escaped and trimmed data.
    const platform = new Platform({
      name: req.body.name,
      company: req.body.company,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("platform_form", {
        title: "Create Platform",
        platform,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.
      // Check if Platform with same name already exists.
      const platformExists = await Platform.findOne({
        name: req.body.name,
      }).exec();
      if (platformExists) {
        // Platform exists, redirect to its detail page.
        res.redirect(platformExists.url);
      } else {
        await platform.save();
        // New platform saved. Redirect to platform detail page.
        res.redirect(platform.url);
      }
    }
  }),
];

// Display Platform delete form on GET.
exports.platform_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of platform and all its games (in parallel)
  const [platform, allGamesInPlatform] = await Promise.all([
    Platform.findById(req.params.id).exec(),
    Game.find({ platform: req.params.id }, "title").exec(),
  ]);

  if (platform === null) {
    // No results.
    res.redirect("/inventory/platforms");
  }

  res.render("platform_delete", {
    title: "Delete Platform",
    platform,
    platform_games: allGamesInPlatform,
  });
});

// Handle Platform delete on POST.
exports.platform_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of platform and all its games (in parallel)
  const [platform, allGamesInPlatform] = await Promise.all([
    Platform.findById(req.params.id).exec(),
    Game.find({ platform: req.params.id }, "title").exec(),
  ]);

  if (allGamesInPlatform.length > 0) {
    // Platform has games. Render in same way as for GET route.
    res.render("platform_delete", {
      title: "Delete Platform",
      platform,
      platform_games: allGamesInPlatform,
    });
  } else {
    // Platform has no games. Delete object and redirect to the list of platforms.
    await Platform.findByIdAndRemove(req.body.platformid);
    res.redirect("/inventory/platforms");
  }
});

// Display Platform update form on GET.
exports.platform_update_get = asyncHandler(async (req, res, next) => {
  const platform = await Platform.findById(req.params.id).exec();

  if (platform === null) {
    // No results.
    const err = new Error("Platform not found");
    err.status = 404;
    return next(err);
  }

  res.render("platform_form", {
    title: "Update Platform",
    platform,
  });
});

// Handle Platform update on POST.
exports.platform_update_post = [
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("company", "Company must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const platform = new Platform({
      name: req.body.name,
      company: req.body.company,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("platform_form", {
        title: "Update Platform",
        platform,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      const updatedPlatform = await Platform.findByIdAndUpdate(
        req.params.id,
        platform,
        {}
      );
      // Redirect to platform detail page.
      res.redirect(updatedPlatform.url);
    }
  }),
];
