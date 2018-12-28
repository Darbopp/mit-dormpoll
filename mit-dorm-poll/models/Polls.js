const database = require('../database');

/**
 * Gets the formatted start and end times of a poll
 * @param {string} initialStartTime - the unformatted start time of a poll
 * @param {string} initialEndTime - the unformatted end time of a poll
 * @return {Object} Formatted times of a poll {startTime, endTime}
 */
async function getPollTimeHelper(initialStartTime, initialEndTime) {
	const startTimeSQL = `SELECT DATE_FORMAT(` + database.escape(initialStartTime) + `, "%W %M %e %Y %r");`
	const startTimeResponse = await database.query(startTimeSQL);
	const startTime = startTimeResponse[0][`DATE_FORMAT(` + database.escape(initialStartTime) + `, "%W %M %e %Y %r")`];

	const endTimeSQL = `SELECT DATE_FORMAT(` + database.escape(initialEndTime) + `, "%W %M %e %Y %r");`
	const endTimeResponse = await database.query(endTimeSQL);
	const endTime = endTimeResponse[0][`DATE_FORMAT(` + database.escape(initialEndTime) + `, "%W %M %e %Y %r")`];

	return {startTime: startTime, endTime: endTime};
}

/**
 * Gets a specific poll by pollId
 * @param {int} pollId - the ID of a poll
 * @return {Poll} A specific poll.
 */
async function getPollHelper(pollId) {
	const pollSql = `SELECT * FROM polls WHERE pollId=` + database.escape(pollId) + `;`;
	const pollResponse = await database.query(pollSql);
	if (pollResponse.length === 0) return undefined;
	const initialStartTime = pollResponse[0].startTime;
	const initialEndTime = pollResponse[0].endTime;
	const pollName = pollResponse[0].pollName;

	const time = await getPollTimeHelper(initialStartTime, initialEndTime);
	const startTime = time['startTime'];
	const endTime = time['endTime'];

	const allQuestions = [];
	const questionSql = `SELECT * FROM questions WHERE pollId=` + database.escape(pollId) + `;`;
	const questionResponse = await database.query(questionSql);

	for (const questionObject of questionResponse) {
		// May need to add logic here to support handling of multiple choice vs writein
		const questionId = questionObject.questionId;
		const questionText = questionObject.questionText;
		const questionType = questionObject.questionType;
		const allChoices = [];

		const choiceSql = `SELECT * FROM choices WHERE questionId='${questionId}';`;
		const choiceResponse = await database.query(choiceSql);

		for (const choiceObject of choiceResponse) {
			const choiceId = choiceObject.choiceId;
			const choiceText = choiceObject.choiceText;
			allChoices.push({ choiceId: choiceId, choiceText: choiceText});
		}

		allQuestions.push({ questionId: questionId, questionText: questionText, questionType: questionType, choices: allChoices});
	}
	const rightNow = new Date();
	const startTimeForCheck = new Date(initialStartTime);
	const endTimeForCheck = new Date(initialEndTime);

	const isOpen = (rightNow < endTimeForCheck && rightNow > startTimeForCheck);
	const result = { pollId: pollId, data: allQuestions, startTime: startTime, endTime: endTime, pollName: pollName, isOpen: isOpen, originalStartTime: initialStartTime, originalEndTime: initialEndTime};
	return result;
}

/**
 * Checks for defined poll name, start and end time, and that end time falls after start time.
 * @param  {object} pollData - {startTime: startTime, endTime: endTime, pollName: pollName}
 * @return {object} - {success: bool, message: string}
 */
function initialPollDataCheck(pollData) {
	if (!pollData.pollName) {
		return { success: false, message: "Please enter a poll name."};
	}

	if (!pollData.startTime || !pollData.endTime) {
		return { success: false, message: "Please specify a start and end time."};
	}

	const startDateTime = new Date(pollData.startTime);
	const endDateTime = new Date(pollData.endTime);

	if (endDateTime.getTime() <= startDateTime.getTime()) {
		return { success: false, message: "The end time must fall after the start time."};
	}
	return {success: true, message: "Initial preconditions passed."};
}

/**
 * Checks that there is at least one question and one choice for every question.
 * Also checks for defined start and end time.
 * @param  {object} pollData - {pollName: pollName, startTime: startTime, endTime: endTime, questionsData: [{ questionText: questionText, questionType: questionType, choices: [{choiceText: choiceText}]}]}
 * @return {object} - {success: bool, message: string}
 */
function pollDataCheck(pollData) {
	const initialCheck = initialPollDataCheck(pollData);
	if (!initialCheck.success) {
		return initialCheck;
	}

	if (pollData.questionsData.length === 0) {
		return {success: false, message: "A poll must have at least one question."};
	}

	for (const questionObject of pollData.questionsData) {
		if (questionObject.questionText.length === 0) {
			return {success: false, message: "You cannot have any empty questions."};
		}

		if (questionObject.choices.length === 0) {
			return {success: false, message: "All questions must have at least one choice."};
		}

		const choices = new Set();

		for (const choiceObject of questionObject.choices) {
			const choiceText = choiceObject.choiceText;
			if (choices.has(choiceText)) {
				return {success: false, message: "You cannot duplicate choices for one quesiton."};
			}

			if (choiceText.length === 0) {
				return {success: false, message: "You cannot have any empty choices."};
			}
			choices.add(choiceText);
		}
	}
	return {success: true, message: "Preconditions passed."};
}

class Polls {
	/**
	 * Determines whether a user has already voted in a poll given their choices.
	 * @param  {string}  username - The user sending the response.
	 * @param  {Object<int, int>}  choices - A mapping of questionIds to choiceIds
	 * @return {Boolean} - whether the user has voted in the poll or not.
	 */
	static async hasAlreadyVotedInPoll(username, choices) {
		const selections = Object.keys(choices);

		const userSql = `SELECT userId FROM users WHERE kerberos=` + database.escape(username) + `;`;
		const userResponse = await database.query(userSql);
		const userId = userResponse[0].userId;

		const pollSql = `SELECT pollId FROM questions WHERE questionId=` + database.escape(selections[0]) + `;`;
		const pollResponse = await database.query(pollSql);
		const pollId = pollResponse[0].pollId;

		const hasVotedSql = `SELECT * FROM responses WHERE pollId=` + database.escape(pollId) + ` AND voterId=` + database.escape(userId) + `;`;
		const hasVotedResponse = await database.query(hasVotedSql);
		return hasVotedResponse.length !== 0;
	}

	/**
	 * Gets a specific poll by pollId
	 * @param {int} pollId - the ID of a poll
	 * @return {Poll} A specific poll.
	 */
	static async getPoll(pollId) {
		const finalPoll = await getPollHelper(pollId);
		return finalPoll;
	}

	/**
	 * Gets all the existing polls.
	 * @return {Array<Poll>} An array of all the existing polls.
	 */
	static async getAllPolls() {
		const pollSql = `SELECT * FROM polls;`;
		const pollResponse = await database.query(pollSql);

		const allPolls = [];

		// Possible refactoring of nested loops here?
		for (const pollObject of pollResponse) {
			const pollId = pollObject.pollId;
			const pollData = await getPollHelper(pollId);
			allPolls.push(pollData);
		}
		return allPolls;
	}

	/**
	 * Creates a new poll.
	 * @param data: {startTime: startTime, endTime: endTime, questionsData: [{ questionText: questionText, questionType: questionType, choices: [{choiceText: choiceText}]}]}
	 * @param {string} username - The username of the user.
	 * @return {object} - {success: bool, message: string}
	 */
	static async createPoll(pollData, username) {
		// Checks for all preconditions (1+ questions, 1+ choices per question, startTime/endTime)
		// Check is done here to avoid first insertion before data is confirmed good.
		const check = pollDataCheck(pollData);
		if (!check.success) {
			return check;
		}

		const startTime = pollData.startTime;
		const endTime = pollData.endTime;
		const pollName = pollData.pollName;

		const pollSql = `INSERT INTO polls (startTime, endTime, pollName) VALUES (` + database.escape(startTime) + `, ` + database.escape(endTime) + `, ` + database.escape(pollName) + `);`;
		await database.query(pollSql);

		const userSql = `SELECT userId FROM users WHERE kerberos=` + database.escape(username) + `;`;
		const userResponse = await database.query(userSql);
		const userId = userResponse[0].userId;

		const pollIdSql = `SELECT MAX(pollId) FROM polls;`;
		const pollIdResponse = await database.query(pollIdSql);
		const pollId = pollIdResponse[0]['MAX(pollId)'];

		const adminSql = `INSERT INTO admins VALUES (` + database.escape(pollId) + `, ` + database.escape(userId) + `);`;
		await database.query(adminSql);

		for (const questionObject of pollData.questionsData) {
			const questionType = questionObject.questionType;
			const questionText = questionObject.questionText;

			const questionSql = `INSERT INTO questions (pollId, questionType, questionText) VALUES (` + database.escape(pollId) + `, ` + database.escape(questionType) + `, ` + database.escape(questionText) + `)`;
			await database.query(questionSql);

			const questionIdSql = `SELECT MAX(questionId) FROM questions;`;
			const questionIdResponse = await database.query(questionIdSql);
			const questionId = questionIdResponse[0]['MAX(questionId)'];

			// If multiple choice, add choices.
			if (questionType === 'multiplechoice') {
				for (const choiceObject of questionObject.choices) {
					const choiceText = choiceObject.choiceText;

					const choiceSql = `INSERT INTO choices (questionId, choiceText) VALUES (` + database.escape(questionId) + `, ` + database.escape(choiceText) + `)`;
					await database.query(choiceSql);
				}
			}
		}

		return { success: true, message: "Poll created successfully!" };
	}

	/**
	 * Edits a poll
	 * @param {int} pollId - the id of the poll being edited.
	 * @param {Array<Object>} data - [{ pollName: pollName, startTime: startTime, endTime: endTime]
	 * @return {Object} - {success: bool, message: string}
	 */
	static async editPoll(pollId, data) {
		const pollCheckSql = `SELECT * FROM polls WHERE pollId=` + database.escape(pollId) + `;`;
		const pollCheckResponse = await database.query(pollCheckSql);
		// If poll doesn't exist, return failure message.
		if (pollCheckResponse.length === 0) {
			return { success: false, message: "This poll no longer exists!" };
		}
		
		// Here we only check that pollName, startTime, & endTime are correct.
		const editedPollDataCheck = initialPollDataCheck(data);
		if (!editedPollDataCheck.success) {
			return editedPollDataCheck;
		}
		const editSql = `UPDATE polls SET pollName=` + database.escape(data['pollName'])
										+ `, startTime=` + database.escape(data['startTime'])
										+ `, endTime=` + database.escape(data['endTime'])
										+ ` WHERE pollId=` + database.escape(pollId);
	  	const editResponse = await database.query(editSql);
		const time = await getPollTimeHelper(data['startTime'], data['endTime']);
		return { success: true, message: time };
	}

	/**
	 * Deletes a poll including all answers, responses, choices, and questions.
	 * @param  {int} pollId - The id of the poll being deleted.
	 * @return {int} The id of the deleted poll.
	 */
	static async deletePoll(pollId) {
		const pollCheckSql = `SELECT * FROM polls WHERE pollId=` + database.escape(pollId) + `;`;
		const pollCheckResponse = await database.query(pollCheckSql);
		// If poll doesn't exist, return failure message.
		if (pollCheckResponse.length === 0) {
			return { success: false, message: "This poll no longer exists!" };
		}

		// Delete all answers/responses
		const responseIdSql = `SELECT responseId FROM responses WHERE pollId=` + database.escape(pollId) + `;`;
		const responseIdResponse = await database.query(responseIdSql);
		for (const responseObject of responseIdResponse) {
			const responseId = responseObject.responseId;

			const answerSql = `DELETE FROM answers WHERE responseId=` + database.escape(responseId) + `;`;
			await database.query(answerSql);
		}

		const responseSql = `DELETE FROM responses WHERE pollId=` + database.escape(pollId) + `;`;
		await database.query(responseSql);

		// Delete all choices/questions
		const questionIdSql = `SELECT questionId FROM questions WHERE pollId=` + database.escape(pollId) + `;`;
		const questionIdResponse = await database.query(questionIdSql);
		for (const questionObject of questionIdResponse) {
			const questionId = questionObject.questionId;

			const choiceSql = `DELETE FROM choices WHERE questionId=` + database.escape(questionId) + `;`;
			await database.query(choiceSql);
		}

		const questionSql = `DELETE FROM questions WHERE pollId=` + database.escape(pollId) + `;`;
		await database.query(questionSql);

		// Delete poll from admins/polls
		const adminSql = `DELETE FROM admins WHERE pollId=` + database.escape(pollId) + `;`;
		await database.query(adminSql);

		const pollSql = `DELETE FROM polls WHERE pollId=` + database.escape(pollId) + `;`;
		await database.query(pollSql);

		return { success: true, message: "Poll successfully deleted!" };
	}
}

module.exports = Polls;
