const nodemailer = require('nodemailer');
const { OpenAIApi } = require('openai');

jest.mock('nodemailer');
jest.mock('openai');

const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

const chatResponseMock = jest.spyOn(OpenAIApi.prototype, 'createChatCompletion');
chatResponseMock.mockReturnValue({ data: { choices: [{ message: { content: '' } }] } });

module.exports = {
  sendMailMock,
  chatResponseMock,
};
