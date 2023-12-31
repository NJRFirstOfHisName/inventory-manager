const mongoose = require("mongoose");

const { Schema } = mongoose;

const GenreSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

// Virtual for genre's URL
GenreSchema.virtual("url").get(function () {
  return `/inventory/genre/${this._id}`;
});

// Export model
module.exports = mongoose.model("Genre", GenreSchema);
