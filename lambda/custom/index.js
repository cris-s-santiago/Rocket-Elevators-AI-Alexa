/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');
const http = require("https");
const axios = require('axios');


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
    && handlerInput.requestEnvelope.request.intent.name === 'GetInfoIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    
    // API calls to get information
    const listOfElevators = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators')
    const listElevatorNotActive = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators/NotActive')
    const listOfBuildings = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/buildings')
    const listOfCustomers =  await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/customers')
    const listOfBatteries = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/batteries')    
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

// The method returns the status of a specific elevator
const GetElevatorStatusHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetElevatorStatusIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    
    // Call the API and return a list of the elevators   
    const listOfElevators = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators')
    const amountOfElevators = JSON.parse(listOfElevators).length
    
    // Validates if the number requested does not exceed the maximum number of elevators
    if (id > amountOfElevators) {
        
    outputSpeech = `The ${id} exceed the number of elevator. The number of elevator deployed is ${amountOfElevators} `;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    const elevatorStatus = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators' + id)
    
    // Parsing the GET requests as JSON
    const elevator = JSON.parse(elevatorStatus).status;
    
    // Creating the voice output with the status of the elevator        
    outputSpeech = `The status of elevator ${id} is ${elevator} `;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};


// The function to get the informations for  of a specific intervention
const GetInfoInterventionHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetInfoInterventionIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    
    // Call the API and return a list of the interventions 
    const listOfInterventions = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/interventions')
    // Parsing the GET requests as JSON
    const amountOfInterventions = JSON.parse(listOfInterventions).length
    
    // Validates if the number requested does not exceed the maximum number of interventions
    if (id > amountOfInterventions) {
        
    outputSpeech = `The ${id} exceed the number of intervention. The maximum number of interventions is ${amountOfInterventions}`;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    
    const objectIntervention = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/interventions/' + id);
    // Parsing the GET requests as JSON for the specific intervention
    const infoIntervention = JSON.parse(objectIntervention)

    // Creating the output speech with the previously declared constants
    outputSpeech = `The intervention ${id} author id is ${infoIntervention.author_id}, the customer id is ${infoIntervention.customer_id}.
    The building id is ${infoIntervention.building_id}. the battery id is ${infoIntervention.battery_id}, the column id is ${infoIntervention.column_id} and the elevator id is ${infoIntervention.elevator_id}.
    The employee id assigned to the call is ${infoIntervention.employee_id}, the description is ${infoIntervention.report}`;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

const ChangeInterventionStatusToProgressHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeInterventionStatusToInProgressIntent"
    );
  },
  async handle(handlerInput) {
      
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
      
    
    return httpPutInterventionStatusInProgress(id, handlerInput);

    //console.log(response);

    //const interventionStatus = getRemoteData("https://rocket-elevators-ai.azurewebsites.net/api/interventions/"+id+"/Status")
    
    // Parsing the GET requests as JSON
    //const intervention = JSON.parse(interventionStatus);

    // Creating the output speech with the previously declared constants
    //const outputSpeech =` The status of intervention id ${id} is change to in ${interventionStatus} `

    // return handlerInput.responseBuilder
    //   .speak(outputSpeech)
    //   .reprompt()
    //   .getResponse();
  }
};

async function httpPutInterventionStatusInProgress(id, handlerInput) {
  return await axios.put("https://rocket-elevators-ai.azurewebsites.net/api/interventions/"+id+"/InProgress",{ id: id, status: 'InProgress'})
      .then(res => {
        console.log("Response", res);
        const outputSpeech =` The status of intervention id ${id} is change to InProgress`

        return handlerInput.responseBuilder
          .speak(outputSpeech)
          .reprompt()
          .getResponse();      
      })
      .catch(function(error){
          console.log("ERROR",error);
          
          return handlerInput.responseBuilder
          .speak("Qualquer coisa")
          .reprompt()
          .getResponse();
      });
}

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
    GetHelloHandler,
    GetInfoHandler,
    GetElevatorStatusHandler,
    GetInfoInterventionHandler,
    ChangeInterventionStatusToProgressHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
     GetElevatorStatusHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();