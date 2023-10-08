const mongoose = require("mongoose");

const { Schema } = mongoose;

const GameSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  developer: { type: String },
  publisher: { type: String },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  platform: [{ type: Schema.Types.ObjectId, ref: "Platform" }],
});

// Virtual for game's URL
GameSchema.virtual("url").get(function () {
  return `/inventory/game/${this._id}`;
});

// Export model
module.exports = mongoose.model("Game", GameSchema);
