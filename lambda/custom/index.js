/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');
const http = require("https");

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';

    await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators')
      .then((response) => {
        const data = JSON.parse(response).length;
        outputSpeech = `There are currently ${data} elevators deployed in the`;
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
  },
};

// ----for finding the elevator status of a specific elevator-----
const GetElevatorStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetElevatorStatusIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }

    const elevatorStatus = await getRemoteElevatorData(
      "https://rocket-elevators-ai.azurewebsites.net/api/elevators/" + id
    );

    const elevator = JSON.parse(elevatorStatus).status;

    outputSpeech = `The status of elevator ${id} is ${elevator} `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

const getRemoteElevatorData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};

//-------------------------

const GetLaunchHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Hello there. How can i help you today?";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt()
      .getResponse();
  }
};



// -----   help commands -----

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "Here is the list of all commands : what is the status of elevator {id},Can you tell me the status of elevator {id}";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};//-----------------------------------------
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? require('https') : require('http');
  const request = client.get(url, (response) => {
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error(`Failed with status code: ${response.statusCode}`));
    }
    const body = [];
    response.on('data', (chunk) => body.push(chunk));
    response.on('end', () => resolve(body.join('')));
  });
  request.on('error', (err) => reject(err));
});

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetLaunchHandler,
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
     GetElevatorStatusHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();