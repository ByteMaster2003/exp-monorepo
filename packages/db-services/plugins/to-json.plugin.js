/**
 * @fileoverview Mongoose plugin to transform document JSON representation
 * @module toJSON
 */

/**
 * Recursively deletes a property from an object using dot notation path
 * @private
 * @param {Object} obj - The object to delete property from
 * @param {string[]} path - Array of path segments
 * @param {number} index - Current index in the path array
 * @example
 * // Deletes nested property 'user.settings.private'
 * deleteAtPath(obj, ['user', 'settings', 'private'], 0);
 */
const deleteAtPath = (obj, path, index) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath(obj[path[index]], path, index + 1);
};

/**
 * Mongoose schema plugin that transforms the JSON output of documents
 * @param {Schema} schema - Mongoose schema to apply the plugin to
 * @returns {void}
 *
 * @description
 * This plugin modifies how Mongoose documents are serialized to JSON by:
 * - Removing fields marked as private in schema options
 * - Converting MongoDB _id to id
 * - Removing internal Mongoose fields (__v)
 * - Removing timestamp fields (createdAt, updatedAt)
 *
 * @example
 * // Using the plugin in a schema
 * const userSchema = new Schema({
 *   email: String,
 *   password: { type: String, private: true }, // Will be removed in JSON
 *   settings: {
 *     theme: String,
 *     apiKey: { type: String, private: true } // Will be removed in JSON
 *   }
 * }, { timestamps: true });
 *
 * userSchema.plugin(toJSON);
 *
 * // Original document
 * {
 *   _id: ObjectId("..."),
 *   email: "user@example.com",
 *   password: "hashed_password",
 *   settings: {
 *     theme: "dark",
 *     apiKey: "secret-key"
 *   },
 *   __v: 0,
 *   createdAt: "2023-...",
 *   updatedAt: "2023-..."
 * }
 *
 * // Transformed JSON
 * {
 *   id: "...",
 *   email: "user@example.com",
 *   settings: {
 *     theme: "dark"
 *   }
 * }
 */
const toJSON = (schema) => {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath(ret, path.split("."), 0);
        }
      });

      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      if (transform) {
        return transform(doc, ret, options);
      }
    }
  });
};

export { toJSON };
