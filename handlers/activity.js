const userActivity = {};

/**
 * @param { String } userId - The user id.
 * @param { String } problemId - The id of the problem (warmup, workout, challenge).
 */
const setActivity = (userId, problemId) => {
    userActivity[userId] = problemId;
};

/**
 * @param { String } userId - The user id.
 */
const deleteActivity = (userId) => {
    delete userActivity[userId];
};

/**
 * @param { String } userId - The user id.
 */
 const getActivity = (userId) => {
    return userActivity[userId];
};

module.exports = { setActivity, deleteActivity, getActivity };
