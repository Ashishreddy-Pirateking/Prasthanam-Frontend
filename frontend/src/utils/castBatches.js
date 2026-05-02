const cleanString = (value) => String(value || "").trim();

const toUniqueStrings = (items) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => cleanString(item))
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
};

const normalizeBatchYear = (value) => {
  const year = cleanString(value);
  return /^\d{4}$/.test(year) ? year : "";
};

const getRollNoPrefix = (year) => `${String(year).slice(-2)}AS00000`;

export const buildCastBatchMetadata = (yearValue) => {
  const id = cleanString(yearValue);
  const normalizedYear = normalizeBatchYear(id);

  if (!normalizedYear) {
    return {
      id,
      label: id ? `Batch of ${id}` : "",
      yearRange: "",
    };
  }

  const yearNumber = Number(normalizedYear);
  const rollNoPrefix = getRollNoPrefix(normalizedYear);

  return {
    id: normalizedYear,
    label: `Batch of ${normalizedYear}`,
    yearRange: `${normalizedYear} - ${yearNumber + 4}/${String(yearNumber + 5).slice(-2)} (Roll No:- ${rollNoPrefix} ala annamaata)`,
  };
};

export const normalizeCastBatchRecord = (batch) => {
  const safeBatch = batch && typeof batch === "object" ? batch : {};
  const metadata = buildCastBatchMetadata(safeBatch.id);

  return {
    ...safeBatch,
    ...metadata,
    id: metadata.id || cleanString(safeBatch.id),
    label: metadata.label || cleanString(safeBatch.label),
    yearRange: metadata.yearRange || cleanString(safeBatch.yearRange),
    members: toUniqueStrings(safeBatch.members),
    governorNames: toUniqueStrings(safeBatch.governorNames),
    photos: toUniqueStrings(safeBatch.photos),
  };
};
