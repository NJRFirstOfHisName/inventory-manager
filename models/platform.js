const mongoose = require("mongoose");

const { Schema } = mongoose;

const PlatformSchema = new Schema({
  name: { type: String, required: true },
  company: { type: String },
});

// Virtual for platform's URL
PlatformSchema.virtual("url").get(function () {
  return `/inventory/platform/${this._id}`;
});

// Export model
module.exports = mongoose.model("Platform", PlatformSchema);
