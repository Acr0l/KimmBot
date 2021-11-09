const userActivity = new Map();

/**
 * @param { String } userId - The user id.
 * @param { String } problemId - The id of the problem (warmup, workout, challenge).
 */
const setActivity = (userId, problemId) => {
    userActivity.set(userId, problemId);
};

/**
 * @param { String } userId - The user id.
 */
const deleteActivity = (userId) => {
    userActivity.delete(userId);
};

/**
 * @param { String } userId - The user id.
 */
 const getActivity = (userId) => {
    return userActivity.get(userId);
};

const hasActivity = (userId) => {
    return userActivity.has(userId);
};

module.exports = { setActivity, deleteActivity, getActivity, hasActivity };
