const paginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @param {Object} [options.projection] - Projection fields to include/exclude
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (filter, options) {
    let sort = "";
    if (options.sortBy) {
      const sortingCriteria = [];
      options.sortBy.split(",").forEach((sortOption) => {
        const [key, order] = sortOption.split(":");
        sortingCriteria.push((order === "desc" ? "-" : "") + key);
      });
      sort = sortingCriteria.join(" ");
    } else {
      sort = "createdAt";
    }

    const limit =
      options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise;

    if (options?.paginate === "false") {
      docsPromise = this.find(filter).sort(sort);
    } else {
      docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);
    }

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        docsPromise = docsPromise.populate(options.populate);
      } else if (typeof options.populate === "string") {
        // Maintain backward compatibility with string format
        options.populate.split(",").forEach((populateOption) => {
          docsPromise = docsPromise.populate(
            populateOption
              .split(".")
              .reverse()
              .reduce((a, b) => ({ path: b, populate: a }))
          );
        });
      }
    }

    if (options.projection) {
      docsPromise = docsPromise.select(options.projection);
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const totalResults = values[0];
      let results = values[1];

      // convert documents toJSON if required
      if (options.toJSON) {
        results = results.map((doc) => doc.toJSON());
      }

      // Turn off pagination if required
      if (options?.paginate === "false") {
        return Promise.resolve(results);
      } else {
        const totalPages = Math.ceil(totalResults / limit);
        const result = {
          results,
          page,
          limit,
          totalPages,
          totalResults
        };
        return Promise.resolve(result);
      }
    });
  };
};

export { paginate };
