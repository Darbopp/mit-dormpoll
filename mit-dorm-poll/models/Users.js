const database = require('../database');

class Users {

	/**
	 * Add a user with a specific username
	 * @param  {string} username - username of the user
	 * @return {User} the User object
	 */
	static async addUser(username) {
			const sql = `INSERT INTO users(kerberos, isAdmin, isVoter) VALUES(` + database.escape(username) + `,` + database.escape(false) + `,` + database.escape(true) + `);`;
			const response = await database.query(sql);
			return response[0];
	}

	/**
	 * Delete a user with a specific userId
	 * @param {int} userId - username of the user
	 * @return {int} - the userId of the deleted user
	 */
	static async deleteUser(userId) {
		const userCheckSql = `SELECT * FROM users WHERE userId=` + database.escape(userId) + `;`;
		const userCheckResponse = await database.query(userCheckSql);
		// If user doesn't exist, return failure message.
		if (userCheckResponse.length === 0) {
			return { userId: userId, success: false, message: "This user no longer exists!" };
		}
		const sql = `DELETE FROM users where userId =`+database.escape(userId)+`;`;
		const response = await database.query(sql);
		return userId;
	}

	/**
	 * Get a user with a specific username
	 * @param  {string} username - username of the user
	 * @return {User} the User object
	 */
	static async getUser(username) {
	    const sql = `SELECT * FROM users WHERE kerberos=` + database.escape(username) + `;`;
	    const response = await database.query(sql);
	    return response[0];
	}

	/**
	 * Get a user with a specific userId
	 * @param  {string} userId - username of the userId
	 * @return {User} the User object
	 */
	static async getUserById(userId) {
	    const sql = `SELECT * FROM users WHERE userId=` + database.escape(userId) + `;`;
	    const response = await database.query(sql);
	    return response[0];
	}

	static async getAllUsers(){
		const sql = `SELECT * FROM users ORDER BY kerberos;`;
		const response = await database.query(sql);
		return response;
	}

	/**
	 * @param  {string} username - username to check adminship
	 * @return {boolean} whether or not the user is an admin
	 */
	static async isAdmin(username) {
		const adminSql = `SELECT isAdmin FROM users WHERE kerberos=` + database.escape(username) + `;`;
		const adminResponse = await database.query(adminSql);
		return adminResponse.length && adminResponse[0].isAdmin;
	}

	/**
	 * Determines whether a particular user is the admin of a particular poll.
	 * @param  {string}  username - The kerberos of the user
	 * @param  {int}  pollId - the id of the poll.
	 * @return {boolean} Whether the user is an admin of the poll with id pollId
	 */
	static async isAdminOfPoll(username, pollId) {
		const userSql = `SELECT userId FROM users WHERE kerberos=` + database.escape(username) + `;`;
		const userResponse = await database.query(userSql);
		const adminId = userResponse[0].userId;

		const adminSql = `SELECT * FROM admins WHERE pollId=` + database.escape(pollId) + ` AND adminId=` + database.escape(adminId) + `;`;
		const adminResponse = await database.query(adminSql);
		return adminResponse.length !== 0;
	}

	/**
	 * Get admin status of a specific user
	 * @param  {int}  userId - userId of user who is having their admin status removed
	 * @return {boolean} Representing if user is admin
	 */
	static async getAdminStatus(userId) {
		const adminSql = `SELECT isAdmin FROM users WHERE userId=` + database.escape(userId) + `;`;
		const adminResponse = await database.query(adminSql);
		return adminResponse.length && adminResponse[0].isAdmin;
	}

	/**
	 * Set admin status of a specific user
	 * @param  {int}  userId - userId of user who is having their admin status removed
	 * @param  {boolean}  isAdmin - new admin status
	 * @return {boolean} Representing if new status is admin
	 */
	static async setAdminStatus(userId, isAdmin) {
		let newStatus = 0;
		if (isAdmin === true) {
			newStatus = 1;
		}
		const updateAdminSql = `UPDATE users SET isAdmin=` + database.escape(newStatus) + ` WHERE userId=` + database.escape(Number(userId)) + `;`;
		const updateAdminResponse = await database.query(updateAdminSql);
		return userId;
	}

	/**
	 * Retrieves all the current admins
	 * @return {Array} All admins
	 */
	static async getAdmins() {
		const adminSql = `SELECT userId, kerberos FROM users WHERE isAdmin=` + database.escape(1) + ` ORDER BY kerberos;`;
		const adminResponse = await database.query(adminSql);
		const admins = []
		for (var adminIdx in adminResponse) {
			const userId = adminResponse[adminIdx]['userId'];
			const kerberos = adminResponse[adminIdx]['kerberos'];
			admins.push({userId: userId, kerberos: kerberos});
		}
		return admins;
	}
}

module.exports = Users;
