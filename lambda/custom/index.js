/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');

// This method is for Alexa's first presentation.
const GetHelloHandler = {
  canHandle(handlerInput) { return handlerInput.requestEnvelope.request.type === "LaunchRequest"; },
  // Returns the created outputSpeech constant.
  handle(handlerInput) {
    const outputSpeech = "Hello, my name is Alexa. Welcome to the Rocket Elevetors System. How can I help you today?";
    return handlerInput.responseBuilder.speak(outputSpeech).reprompt().getResponse();
  }
};

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

// The method returns a summary of Rocket Elevator's activities, when asked "Hey Alexa, What is going on at Rocket Elevators?"
const GetInfoHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest' 
    && handlerInput.requestEnvelope.request.intent.name === 'GetInfoIntent'); },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    
    // API calls to get information
    const listOfElevators = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators')
    const listElevatorNotActive = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators/NotActive')
    const listOfBuildings = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/buildings')
    const listOfCustomers =  await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/customers')
    const listOfBatteries = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/batteries/')    
    const listOfCity = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/Addresses/City')
    const listOfQuote = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/quotes')    
    const listOfLead = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/leads')
    
    // Parsing the GET requests as JSON
    const amountOfElevators = JSON.parse(listOfElevators).length
    const amountOfElevatorNotActive = JSON.parse(listElevatorNotActive).length
    const amountOfBuildings = JSON.parse(listOfBuildings).length
    const amountOfCustomers = JSON.parse(listOfCustomers).length
    const amountOfBatteries = JSON.parse(listOfBatteries).length
    const amountOfCitys = JSON.parse(listOfCity).length
    const amountOfQuotes = JSON.parse(listOfQuote).length
    const amountOfLeads = JSON.parse(listOfLead).length   
    
    // Creating the voice output with the quantity returned from the APIs 
    outputSpeech = `Greetings, there are currently ${amountOfElevators} elevators deployed in the ${amountOfBuildings} buildings
    of your ${amountOfCustomers} customers. Currently, ${amountOfElevatorNotActive} are not in Running Status and are being serviced.
    ${amountOfBatteries} Batteries are deployed across ${amountOfCitys} cities. On another note, you currently have ${amountOfQuotes} 
    quotes awaiting processing. You also have ${amountOfLeads} leads in your contact requests.`;
    
    // Returning the output speech
    return handlerInput.responseBuilder.speak(outputSpeech).getResponse();
    
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

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
    GetHelloHandler,
    GetInfoHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();