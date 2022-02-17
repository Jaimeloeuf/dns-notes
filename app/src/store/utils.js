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
 * If the API call failed, recursively dispatch the action again if user wants to retry,
 * And caller should always make sure to return so code execution does not continue
 * @param {String} errorString Error message to show user when asking them if they want to retry
 * @param {function} dispatch The vuex dispatch action function
 * @param {String} action The name of the vuex action that calls this function, to recursively dispatch
 * @param {*} payload The payload required by the action
 */
export const failed = (errorString, dispatch, action, payload) =>
  confirm(`Error: \n${errorString}\n\nTry again?`) && dispatch(action, payload);

/**
 * Wraps action to catch any errors, handles them and allow user to retry by recursively dispatch action again
 * @param {function} actionFn The vuex action function to wrap
 * @param {String} [actionName] Optional string to override the function's name to use as the action's name
 */
export const errorHandlingWrapper =
  (actionFn, actionName) => async (context, payload) =>
    // Wrap action so that synchronous functions can have their errors caught using .catch too
    Promise.resolve(actionFn(context, payload)).catch(
      (error) =>
        confirm(`Error: \n${error.message}\n\nTry again?`) &&
        context.dispatch(actionName || actionFn.name, payload)
    );
