const database = require('../database');
const Users = require('./Users');

/**
 * Checks that there is at least one response for every question.
 * @param  {object} responseData - {questionId: choiceId}
 * @param  {int} pollId - id of the Poll
 * @return {object} - {success: bool, message: string}
 */
async function responseDataCheck(responseData, pollId) {
	const timeSql = `SELECT * FROM polls WHERE pollId=` + database.escape(pollId) + `;`;
	const timeResponse = await database.query(timeSql);
	const startDateTime = new Date(timeResponse[0].startTime)
	const endDateTime = new Date(timeResponse[0].endTime);
	const rightNow = new Date();

	if (rightNow > endDateTime || rightNow < startDateTime) {
		return { success: false, message: "Sorry, this poll is closed!" };
	}

	const questionsSql = `SELECT questionId FROM questions WHERE pollId=` + database.escape(pollId) + `;`;
	const questionsResponse = await database.query(questionsSql);
	for (let i = 0; i < questionsResponse.length; i++) {
		const questionId = questionsResponse[i].questionId;
		if (!responseData[questionId]) {
			return { success: false, message: "Please answer every question." };
		}
	}
	return { success: true, message: "Preconditions passed."};
}

/**
 * Sorts an array by a specific key
 * @param  {object} array - array of data
 * @param  {object} key - key to be sorted upon
 * @return {object} - sorted array by key, ordered from greatest to least
 */
function sortByKey(array, key) {
		let result = array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    return result.reverse();
}

class Responses {
	/**
	 * Handles sending the response for a single poll.
	 * If database data is not set up correctly, this will fail BADLY.
	 * @param  {string} username - The user sending the response.
	 * @param  {object<int, int>} choices - A mapping of questionIds to choiceIds
	 * @return {object} - {success: bool, message: string}
	 */
	static async sendResponse(username, choices) {
		const selections = Object.keys(choices);

		const userSql = `SELECT userId FROM users WHERE kerberos=` + database.escape(username) + `;`;
		const userResponse = await database.query(userSql);
		const userId = userResponse[0].userId;

		const pollSql = `SELECT pollId FROM questions WHERE questionId=` + database.escape(selections[0]) + `;`;
		const pollResponse = await database.query(pollSql);
		const pollId = pollResponse[0].pollId;

		// Checks for all preconditions (A response to every question)
		// Check is done here to avoid first insertion before data is confirmed good.
		const check = await responseDataCheck(choices, pollId);
		if (!check.success) {
			return check;
		}

		const responseSql = `INSERT INTO responses (pollId, voterId) VALUES (` + database.escape(pollId) + `, ` + database.escape(userId) + `)`;
		await database.query(responseSql);

		const responseIdSql = `SELECT MAX(responseId) FROM responses;`;
		const responseQuery = await database.query(responseIdSql);
		const responseId = responseQuery[0]['MAX(responseId)'];

		for (let i = 0; i < selections.length; i++) {
			const questionId = selections[i];
			const questionTypeSql = `SELECT questionType FROM questions WHERE questionId=` + database.escape(questionId) + `;`;
	        const questionTypeResponse = await database.query(questionTypeSql);
	        const questionType = questionTypeResponse[0].questionType;

	        if (questionType === 'multiplechoice') {
				const choiceId = choices[selections[i]];

				const choiceSql = `SELECT choiceText FROM choices WHERE choiceId=` + database.escape(choiceId) + `;`;
				const choiceResponse = await database.query(choiceSql);
				const choiceText = choiceResponse[0].choiceText;

				const answerSql = `INSERT INTO answers (responseId, questionId, answerText) VALUES (` + database.escape(responseId) + `, ` + database.escape(questionId) + `, ` + database.escape(choiceText) + `)`;
				await database.query(answerSql);
			} else {
				const answerText = choices[selections[i]];

		        const answerSql = `INSERT INTO answers (responseId, questionid, answerText) VALUES (` + database.escape(responseId) + `, ` + database.escape(questionId) + `, ` + database.escape(answerText) + `)`;
		        await database.query(answerSql);
			}
		}
		return { success: true, message: "Success! Thank you for voting!" };
	}

  	/**
  	 * Delete the user's old response to the poll and add their new responses.
  	 * @param  {string} username - name of the user updating their response.
  	 * @param  {object<int, int>} choices - {questionId: choiceId}
  	 * @return {object} - { success: bool, message: string }
  	 */
  	static async updateResponse(username, choices) {
  	  const selections = Object.keys(choices);

  	  const userSql = `SELECT userId FROM users WHERE kerberos=` + database.escape(username) + `;`;
      const userResponse = await database.query(userSql);
      const userId = userResponse[0].userId;

      const pollSql = `SELECT pollId FROM questions WHERE questionId=` + database.escape(selections[0]) + `;`;
      const pollResponse = await database.query(pollSql);
      const pollId = pollResponse[0].pollId;

      // Checks for all preconditions (A response to every question)
      // Check is done here to avoid first insertion before data is confirmed good.
      const check = await responseDataCheck(choices, pollId);
      if (!check.success) {
        return check;
      }

      // Delete old Response
      const oldResponseIdSql = `SELECT responseId FROM responses WHERE pollId=` + database.escape(pollId) + ` AND voterId=` + database.escape(userId) + `;`;
      const oldResponseIdResponse = await database.query(oldResponseIdSql);
      const oldResponseId = oldResponseIdResponse[0].responseId;

      const deleteOldAnswersSql = `DELETE FROM answers WHERE responseId=` + database.escape(oldResponseId) + `;`;
      await database.query(deleteOldAnswersSql);

      const deleteOldResponseSql = `DELETE FROM responses WHERE responseId=` + database.escape(oldResponseId) +  `;`;
      await database.query(deleteOldResponseSql);

      // Add new Response
      const responseSql = `INSERT INTO responses (pollId, voterId) VALUES (` + database.escape(pollId) + `, ` + database.escape(userId) + `)`;
      await database.query(responseSql);

      const responseIdSql = `SELECT MAX(responseId) FROM responses;`;
      const responseQuery = await database.query(responseIdSql);
      const responseId = responseQuery[0]['MAX(responseId)'];

      for (let i = 0; i < selections.length; i++) {
        const questionId = selections[i];
        const questionTypeSql = `SELECT questionType FROM questions WHERE questionId=` + database.escape(questionId) + `;`;
        const questionTypeResponse = await database.query(questionTypeSql);
        const questionType = questionTypeResponse[0].questionType;

        if (questionType === 'multiplechoice') {
          const choiceId = choices[selections[i]];

          const choiceSql = `SELECT choiceText FROM choices WHERE choiceId=` + database.escape(choiceId) + `;`;
          const choiceResponse = await database.query(choiceSql);
          const choiceText = choiceResponse[0].choiceText;

          const answerSql = `INSERT INTO answers (responseId, questionId, answerText) VALUES (` + database.escape(responseId) + `, ` + database.escape(questionId) + `, ` + database.escape(choiceText) + `)`;
          await database.query(answerSql);
        } else {
          const answerText = choices[selections[i]];

          const answerSql = `INSERT INTO answers (responseId, questionid, answerText) VALUES (` + database.escape(responseId) + `, ` + database.escape(questionId) + `, ` + database.escape(answerText) + `)`;
          await database.query(answerSql);
        }
      }
      return { success: true, message: "Success! Your response has been updated!" };
  	}

	/**
	 * Handles getting a user's response for a single poll.
	 * @param  {string} username - The user sending the response.
	 * @param  {string} pollId - A mapping of questionIds to choiceIds
	 * @return {Array[Object]} - answers that corresponds to a user's response for a poll
	 */
	static async getResponse(username, pollId) {
		const userSql = `SELECT userId FROM users WHERE kerberos=` + database.escape(username) + `;`;
		const userResponse = await database.query(userSql);
		const userId = userResponse[0].userId;

		const responseSql = `SELECT * from responses where pollId = ${database.escape(pollId)} AND voterId = ${database.escape(userId)}`;
		const responseResponse = await database.query(responseSql);
		if (responseResponse[0] === undefined) return [];
		const responseId = responseResponse[0].responseId;

		const answersSql = `SELECT * FROM answers where responseId = ${responseId}`
		const answersResponse = await database.query(answersSql);

		return answersResponse;
	}

	/**
     * Handles getting all responses for a single poll.
     * @param  {string} pollId - A mapping of questionIds to choiceIds
		 * @return {Array[Object]} - all the responses of a single poll in the form {questionId: int, question: string, response: []}
     */
	static async getAnswers(pollId) {
    const results = [];
    const questionSql = `SELECT * from questions WHERE pollId=` + database.escape(pollId) + `AND questionType=` + database.escape("multiplechoice") + `;`;
    const questionResponse = await database.query(questionSql);
			for(var questionIdx in questionResponse) {
				const questionResult = [];
				const question = questionResponse[questionIdx];
	      		const choiceSql = `SELECT * from choices WHERE questionId=` + database.escape(question.questionId) + `;`
	      		const choiceResponse = await database.query(choiceSql);
				for (const choiceIdx in choiceResponse) {
					const choice = choiceResponse[choiceIdx];
	        		const countAnswerSql = `SELECT COUNT(questionId) from answers WHERE answerText=` + database.escape(choice.choiceText) + `AND questionId=` + database.escape(question.questionId) + `;`;
	        		const countAnswerResponse = await database.query(countAnswerSql);
					const numVotes = countAnswerResponse[0]['COUNT(questionId)'];
					questionResult.push({choice: choice.choiceText, count: numVotes});
	      }
				sortByKey(questionResult, 'count');
				results.push({questionId: question.questionId, question: question.questionText, response: questionResult});
	    }
	    return results;
  }

  /**
    * Handles getting all responses for a single poll.
    * @param  {string} pollId - A mapping of questionIds to choiceIds
  */
  static async getSheet(pollId) {
    const results = [];
    const responseSql = `SELECT * from responses WHERE pollId=` + database.escape(pollId) + `;`;
    const responseResponse = await database.query(responseSql);
    const questionSql = `SELECT * from questions WHERE pollId=` + database.escape(pollId) + `;`;
    let questionResponse = await database.query(questionSql);
    questionResponse = questionResponse.sort((a, b) => a.questionId > b.questionId).map((x) => x.questionText)
    questionResponse.unshift('Name');
    let data = await Promise.all(responseResponse.map(async (x) => {
      const choiceSql = `SELECT * from answers WHERE responseId=` + database.escape(x.responseId) + `;`
      let choiceResponse = await database.query(choiceSql);
      let choices = choiceResponse.sort((a, b) => a.questionId > b.questionId).map((x) => x.answerText);
      const userSql = `SELECT * from users WHERE userId=` + database.escape(x.voterId) + `;`;
      choices.unshift((await database.query(userSql))[0].kerberos);
      return choices;
    }));
    return {
      data: data,
      columns: questionResponse
    }
  }
}

module.exports = Responses;
