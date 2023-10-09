#! /usr/bin/env node

console.log(
  'This script populates a test inventory of games, genres, and platforms. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/game_store?retryWrites=true&w=majority"'
);

const userArgs = process.argv.slice(2);

const mongoose = require("mongoose");

const Genre = require("./models/genre");
const Platform = require("./models/platform");
const Game = require("./models/game");

const genres = [];
const platforms = [];
const games = [];

mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createGenres();
  await createPlatforms();
  await createGames();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function genreCreate(index, name, description) {
  const genre = new Genre({ name, description });

  await genre.save();
  genres[index] = genre;
  console.log(`Added genre: ${name}`);
}

async function platformCreate(index, name, company) {
  const platform = new Platform({ name, company });

  await platform.save();
  platforms[index] = platform;
  console.log(`Added platform: ${name}`);
}

async function gameCreate(
  index,
  title,
  description,
  price,
  stock,
  developer,
  publisher,
  genre,
  platform
) {
  const gamedetail = {
    title,
    description,
    price,
    stock,
    developer,
    publisher,
    genre,
    platform,
  };

  const game = new Game(gamedetail);
  await game.save();
  games[index] = game;
  console.log(`Added game: ${title}`);
}

async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate(
      0,
      "First-Person Shooter",
      "Shooty-bang games where you bang bang zing rat-a-tat pow!"
    ),
    genreCreate(
      1,
      "Role-Playing Game",
      "Control a character or party of characters as they do heroic stuff."
    ),
    genreCreate(
      2,
      "Action",
      "Pow! Bad guys doing bad guy things? Bam! Pop em right in the kisser! Kazooie!"
    ),
    genreCreate(
      3,
      "Sports",
      "Pretend to play real sports while the computer totally cheats."
    ),
    genreCreate(4, "Adventure", "Go exploring and find cool stuff."),
  ]);
}

async function createPlatforms() {
  console.log("Adding platforms");
  await Promise.all([
    platformCreate(0, "Switch", "Nintendo"),
    platformCreate(1, "PlayStation 5", "Sony"),
    platformCreate(2, "Xbox", "Microsoft"),
    platformCreate(3, "PC", "Microsoft"),
  ]);
}

async function createGames() {
  console.log("Adding games");
  const max = 10;
  function getStock() {
    return Math.floor(Math.random() * max).toString();
  }

  await Promise.all([
    gameCreate(
      0,
      "Call of Duty: Modern Warfare II",
      "Good guys gripping guns gallantly and griping grossly greet grave generals as they gallivant globally.",
      "69.99",
      getStock(),
      "Infinity Ward",
      "Activision",
      [genres[0]],
      [platforms[1], platforms[2], platforms[3]]
    ),
    gameCreate(
      1,
      "Elden Ring",
      "Explore a massive, mysterious world in which everything wants to kill you.",
      "49.99",
      getStock(),
      "FromSoftware",
      "Bandai Namco Entertainment",
      [genres[1], genres[2]],
      [platforms[1], platforms[2], platforms[3]]
    ),
    gameCreate(
      2,
      "Madden NFL 23",
      "Play football!",
      "14.99",
      getStock(),
      "EA Tiburon",
      "EA Sports",
      [genres[3]],
      [platforms[1], platforms[2], platforms[3]]
    ),
    gameCreate(
      3,
      "God of War Ragnarok",
      "Go on a rip-roaring adventure as a father bonding with his son.",
      "69.99",
      getStock(),
      "Santa Monica Studio",
      "Sony Interactive Entertainment",
      [genres[2], genres[4]],
      [platforms[1]]
    ),
    gameCreate(
      4,
      "Lego Star Wars: The Skywalker Saga",
      "Play through all 9 mainline Star Wars movies as a variety of tiny Lego dudes.",
      "29.99",
      getStock(),
      "Traveller's Tales",
      "Warner Bros. Games",
      [genres[2], genres[4]],
      [platforms[0], platforms[1], platforms[2], platforms[3]]
    ),
    gameCreate(
      5,
      "Pokemon Scarlet/Violet",
      "It's Pokemon, you know what to expect.",
      "59.99",
      getStock(),
      "Game Freak",
      "Nintendo",
      [genres[1]],
      [platforms[0]]
    ),
    gameCreate(
      6,
      "Fifa 23",
      "Play football!",
      "29.99",
      getStock(),
      "EA Vancouver, EA Romania",
      "EA Sports",
      [genres[3]],
      [platforms[0], platforms[1], platforms[2], platforms[3]]
    ),
    gameCreate(
      7,
      "Pokemon Legends: Arceus",
      "Explore an open world while engaging in series-first action gameplay! Whoa.",
      "59.99",
      getStock(),
      "Game Freak",
      "Nintendo",
      [genres[1], genres[2]],
      [platforms[0]]
    ),
    gameCreate(
      8,
      "Horizon Forbidden West",
      "Hunt dinosaur-looking robots with a bow.",
      "49.99",
      getStock(),
      "Guerilla Games",
      "Sony Interactive Entertainment",
      [genres[1], genres[2]],
      [platforms[1]]
    ),
    gameCreate(
      9,
      "MLB The Show 22",
      "Play baseball!",
      "59.99",
      getStock(),
      "San Diego Studio",
      "Sony Interactive Entertainment",
      [genres[3]],
      [platforms[0], platforms[1], platforms[2]]
    ),
  ]);
}
