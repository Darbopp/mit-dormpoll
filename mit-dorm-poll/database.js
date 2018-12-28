const mysql = require('mysql');

const config = {
  host: 'sql.mit.edu',
  user: 'Kerberos',
  password: 'Password',
  database: 'NameOfDatabase',
};

class Database {
  constructor(dbConfig) {
    this.connection = mysql.createPool(dbConfig);
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, rows) => {
        if (err) { return reject(err); }
        resolve(rows);
      });
    });
  }

  // Helper function to mitigate SQL injection attacks
  escape(stringToEscape) {
    return this.connection.escape(stringToEscape);
  }

  // This is a helper function to close a connection to the database.
  // The connection also closes when the program stops running.
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) { return reject( err ); }
        resolve();
      });
    });
  }

  async createTables() {
    await this.query(`CREATE TABLE IF NOT EXISTS users (
      userId INT PRIMARY KEY AUTO_INCREMENT,
      kerberos VARCHAR( 16 ) NOT NULL UNIQUE,
      isAdmin BOOLEAN NOT NULL,
      isVoter BOOLEAN NOT NULL
      );`
    ).catch(err => console.log(err));

    await this.query(`CREATE TABLE IF NOT EXISTS polls (
      pollId INT PRIMARY KEY AUTO_INCREMENT,
      startTime DATETIME NOT NULL,
      endTime DATETIME NOT NULL,
      pollName TEXT NOT NULL
      );`
    ).catch(err => console.log(err));

    await this.query(`CREATE TABLE IF NOT EXISTS admins (
      pollId INT NOT NULL REFERENCES polls(pollId),
      adminId INT NOT NULL REFERENCES users(userId),
      CONSTRAINT PK_Admin PRIMARY KEY (pollId, adminId)
      );`
    ).catch(err => console.log(err));

    await this.query(`CREATE TABLE IF NOT EXISTS questions (
      questionId INT PRIMARY KEY AUTO_INCREMENT,
      pollId INT NOT NULL REFERENCES polls(pollId),
      questionType ENUM('multiplechoice', 'writein') NOT NULL,
      questionText TEXT NOT NULL
      );`
    ).catch(err => console.log(err));

    await this.query(`CREATE TABLE IF NOT EXISTS choices (
    	choiceId INT PRIMARY KEY AUTO_INCREMENT,
      questionId INT NOT NULL REFERENCES questions(questionId),
      choiceText TEXT NOT NULL
      );`
    ).catch(err => console.log(err));

    await this.query(`CREATE TABLE IF NOT EXISTS responses (
    	responseId INT PRIMARY KEY AUTO_INCREMENT,
      pollId INT NOT NULL REFERENCES polls(pollId),
      voterId INT NOT NULL REFERENCES users(userId)
      );`
    ).catch(err => console.log(err));

    await this.query(`CREATE TABLE IF NOT EXISTS answers (
    	answerId INT PRIMARY KEY AUTO_INCREMENT,
      responseId INT NOT NULL REFERENCES responses(responseId),
      questionId INT NOT NULL REFERENCES questions(questionId),
      answerText TEXT
      );`
    ).catch(err => console.log(err));
  }

  /* Used for testing */
  async clearTables() {
    await database.query('TRUNCATE TABLE users');
    await database.query('TRUNCATE TABLE polls');
    await database.query('TRUNCATE TABLE admins');
    await database.query('TRUNCATE TABLE questions');
    await database.query('TRUNCATE TABLE choices');
    await database.query('TRUNCATE TABLE responses');
    await database.query('TRUNCATE TABLE answers');
  }
}

const database = new Database(config);

module.exports = database
