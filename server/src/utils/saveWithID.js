/**
 * Works like firestore.add(), but with the firestore doc ID set on the object itself,
 * and have the update value returned to you.
 *
 * Ref: https://firebase.google.com/docs/firestore/manage-data/add-data#node.js_6
 *
 * @param {Firestore} fs Firestore service
 * @param {String} collection String ID of the collection to save to
 * @param {object} value Whatever object value you want to save into that collection
 * @returns An updated copy of the value object you passed in with the firestore doc id set on it
 */
module.exports = async function saveWithID(fs, collection, value) {
  // https://firebase.google.com/docs/firestore/manage-data/add-data#node.js_6
  const ref = fs.collection(collection).doc();
  const { id } = ref;
  value.id = id;

  // Simply await for the operation to complete without saving the return value,
  // as only the write time is returned and it is generally not useful
  await ref.set(value);

  // Return the modified value
  return value;
};
