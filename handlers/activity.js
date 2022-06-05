const userActivity = new Map();

const setActivity = (userId, problemId) => {
	userActivity.set(userId, problemId);
};

const deleteActivity = (userId) => {
	userActivity.delete(userId);
};

const getActivity = (userId) => {
	return userActivity.get(userId);
};

const hasActivity = (userId) => {
	return userActivity.has(userId);
};

module.exports = { setActivity, deleteActivity, getActivity, hasActivity };
