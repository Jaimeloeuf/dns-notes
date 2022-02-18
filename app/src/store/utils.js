/*
  Module for utilities used by the vuex store
*/

/**
 * Utils module to easily create a new action function to handle lazily created actions
 * @param {Function} loader A loader function that returns a Promise that resolves to a module, a.k.a () => import(path)
 * @returns Action function
 */
export const lazilyLoad = (loader) => async (context, payload) =>
  loader().then(({ default: fn }) => fn(context, payload));

/**
 * Wraps action to catch any errors, handles them and allow user to retry by recursively dispatch action again
 * @param {function} actionFn The vuex action function to wrap, function needs to be named as the action name
 */
export const errorHandlingWrapper = (actionFn) => async (context, payload) =>
  // Wrap action so that synchronous functions can have their errors caught using .catch too
  Promise.resolve(actionFn(context, payload)).catch(
    (error) =>
      confirm(`Error: \n${error.message}\n\nTry again?`) &&
      context.dispatch(actionFn.name, payload)
  );
