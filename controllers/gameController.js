const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Game = require("../models/game");
const Platform = require("../models/platform");
const Genre = require("../models/genre");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of games, platforms and genre counts (in parallel)
  const [numGames, numPlatforms, numGenres] = await Promise.all([
    Game.countDocuments({}).exec(),
    Platform.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Big Ol' Video Game Store",
    game_count: numGames,
    platform_count: numPlatforms,
    genre_count: numGenres,
  });
});

// Display list of all games.
exports.game_list = asyncHandler(async (req, res, next) => {
  const allGames = await Game.find().sort({ title: 1 }).exec();

  res.render("game_list", { title: "Game List", game_list: allGames });
});

// Display detail page for a specific game.
exports.game_detail = asyncHandler(async (req, res, next) => {
  // Get details of games, game instances for specific game
  const [game, genres, platforms] = await Promise.all([
    Game.findById(req.params.id).populate("platform").populate("genre").exec(),
    Genre.find({ game: req.params.id }).exec(),
    Platform.find({ game: req.params.id }).exec(),
  ]);

  if (game === null) {
    // No results.
    const err = new Error("Game not found");
    err.status = 404;
    return next(err);
  }

  res.render("game_detail", {
    title: game.title,
    game,
    genres,
    platforms,
  });
});

// Display game create form on GET.
exports.game_create_get = asyncHandler(async (req, res, next) => {
  // Get all platforms and genres, which we can use for adding to our game.
  const [allPlatforms, allGenres] = await Promise.all([
    Platform.find().exec(),
    Genre.find().exec(),
  ]);

  res.render("game_form", {
    title: "Create Game",
    platforms: allPlatforms,
    genres: allGenres,
  });
});

// Handle game create on POST.
exports.game_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("devloper").escape(),
  body("publisher").escape(),
  body("genre.*").escape(),
  body("platform.*").escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped and trimmed data.
    const game = new Game({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      developer: req.body.developer,
      publisher: req.body.publisher,
      genre: req.body.genre,
      platform: req.body.platform,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all platforms and genres for form.
      const [allPlatforms, allGenres] = await Promise.all([
        Platform.find().exec(),
        Genre.find().exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (game.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }
      res.render("game_form", {
        title: "Create Game",
        platforms: allPlatforms,
        genres: allGenres,
        game,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save game.
      await game.save();
      res.redirect(game.url);
    }
  }),
];

// Display Game delete form on GET.
exports.game_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of game and all its instances (in parallel)
  const game = await Game.findById(req.params.id)
    .populate("platform")
    .populate("genre")
    .exec();

  if (game === null) {
    // No results.
    res.redirect("/inventory/games");
  }

  res.render("game_delete", {
    title: "Delete Game",
    game,
  });
});

// Handle game delete on POST.
exports.game_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of game and all its instances (in parallel)
  const game = await Game.findById(req.params.id)
    .populate("platform")
    .populate("genre")
    .exec();

  if (game.stock > 0) {
    // Game has instances. Render in same way as for GET route.
    res.render("game_delete", {
      title: "Delete Game",
      game,
    });
  } else {
    // Game has no instances. Delete object and redirect to the list of games.
    await Game.findByIdAndRemove(req.body.gameid);
    res.redirect("/inventory/games");
  }
});

// Display game update form on GET.
exports.game_update_get = asyncHandler(async (req, res, next) => {
  // Get game, platforms and genres for form.
  const [game, allPlatforms, allGenres] = await Promise.all([
    Game.findById(req.params.id).populate("platform").populate("genre").exec(),
    Platform.find().exec(),
    Genre.find().exec(),
  ]);

  if (game === null) {
    // No results.
    const err = new Error("Game not found");
    err.status = 404;
    return next(err);
  }

  // Mark our selected genres as checked.
  for (const genre of allGenres) {
    for (const game_g of game.genre) {
      if (genre._id.toString() === game_g._id.toString()) {
        genre.checked = "true";
      }
    }
  }

  res.render("game_form", {
    title: "Update Game",
    platforms: allPlatforms,
    genres: allGenres,
    game,
  });
});

// Handle game update on POST.
exports.game_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("devloper").escape(),
  body("publisher").escape(),
  body("genre.*").escape(),
  body("platform.*").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped/trimmed data and old id.
    const game = new Game({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      developer: req.body.developer,
      publisher: req.body.publisher,
      genre: req.body.genre,
      platform: req.body.platform,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all platforms and genres for form
      const [allPlatforms, allGenres] = await Promise.all([
        Platform.find().exec(),
        Genre.find().exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (game.genre.indexOf(genre._id) > -1) {
          genre.checked = "true";
        }
      }
      res.render("game_form", {
        title: "Update Game",
        platforms: allPlatforms,
        genres: allGenres,
        game,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      const updatedGame = await Game.findByIdAndUpdate(req.params.id, game, {});
      // Redirect to game detail page.
      res.redirect(updatedGame.url);
    }
  }),
];
