/* eslint-disable no-use-before-define */
/* eslint-disable global-require */
const Alexa = require('ask-sdk-core');
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
    const elevatorStatus = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/elevators/' + id)
    
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


// The method returns the details of a specific elevator
const GetElevatordetails = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetElevatordetailsIntent"
    );
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

    const elevatorStatus = await getRemoteData("https://rocket-elevators-ai.azurewebsites.net/api/elevators/" + id);

    const elevator = JSON.parse(elevatorStatus).status;
    const serialnumber = JSON.parse(elevatorStatus).serial_number;   
    const elevatormodel = JSON.parse(elevatorStatus).model; 
    const elevatortype = JSON.parse(elevatorStatus).building_type;
    const elevatorinfo = JSON.parse(elevatorStatus).information;
    const columnId = JSON.parse(elevatorStatus).column_id;    

    outputSpeech = `The status of elevator ${id} is ${elevator}, it has a serial number ${serialnumber}, elevator model is ${elevatormodel}, its the type is ${elevatortype}, information is ${elevatorinfo} and belongs to Column Id ${columnId}.`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// The method change the status of a specific elevator
const ChangeElevatorStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeElevatorStatusIntent"
    );
  },
  async handle(handlerInput) {
      
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    const status = handlerInput.requestEnvelope.request.intent.slots.status.value;      
    
    return httpPutElevatorStatus(id, status, handlerInput);

  }
};

async function httpPutElevatorStatus(id, status, handlerInput) {
  return await axios.put("https://rocket-elevators-ai.azurewebsites.net/api/elevators/"+id+"/Status",{ id: id, status: status})
      .then(res => {
        console.log("Response", res);
         const outputSpeech =`The status of elevators id ${id} is change to ${status}`

        return handlerInput.responseBuilder
          .speak(outputSpeech)
          .reprompt()
          .getResponse();      
      })
      .catch(function(error){
          console.log("ERROR",error);
          
          return handlerInput.responseBuilder
          .speak(error.status)
          .reprompt()
          .getResponse();
      });
}


// The method returns the details of a specific customer
const GetCustomersdetails = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetCustomerdetailsIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;

    // Call the API and return a list of the elevators   
    const listOfCustomers = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/customers')
    const amountOfCustomers = JSON.parse(listOfCustomers).length
    
    // Validates if the number requested does not exceed the maximum number of elevators
    if (id > amountOfCustomers) {
        
    outputSpeech = `The ${id} exceed the number of customers. The total number of customers is ${amountOfCustomers} `;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }

    const customerStatus = await getRemoteData("https://rocket-elevators-ai.azurewebsites.net/api/customers/" + id);

    const companyName = JSON.parse(customerStatus).company_name;
    const fullName = JSON.parse(customerStatus).full_name_of_company_contact;
    const companyContact = JSON.parse(customerStatus).company_contact_phone;
    const email = JSON.parse(customerStatus).email_of_company_contact;
    const description = JSON.parse(customerStatus).company_description;
    const technicalAuthority = JSON.parse(customerStatus).full_name_of_service_technical_authority;
    const technicalManager = JSON.parse(customerStatus).technical_manager_email_for_service;    

    outputSpeech = `The customer ${id} 's comany name is ${companyName}, it contact person is  ${fullName}, his phone number is ${companyContact}, his email address is ${email}. The company description is ${description}, the technical person's name is ${technicalAuthority} and his email is ${technicalManager}.`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// The method returns the status of a specific column
const GetColumnStatusHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetColumnStatusIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    
    // Call the API and return a list of the elevators   
    const listOfColumns = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/columns')
    const amountOfColumns = JSON.parse(listOfColumns).length
    
    // Validates if the number requested does not exceed the maximum number of elevators
    if (id > amountOfColumns) {
        
    outputSpeech = `The ${id} exceed the number of elevator. The number of elevator deployed is ${amountOfColumns} `;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    const columnStatus = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/columns/' + id)
    
    // Parsing the GET requests as JSON
    const column = JSON.parse(columnStatus).status;
    
    // Creating the voice output with the status of the elevator        
    outputSpeech = `The status of column ${id} is ${column} `;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// The method change the status of a specific column
const ChangeColumnStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeColumnStatusIntent"
    );
  },
  async handle(handlerInput) {
      
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    const status = handlerInput.requestEnvelope.request.intent.slots.status.value;
      
    
    return httpPutColumnStatus(id, status, handlerInput);

  }
};

async function httpPutColumnStatus(id, status, handlerInput) {
  return await axios.put("https://rocket-elevators-ai.azurewebsites.net/api/columns/"+id+"/Status",{ id: id, status: status})
      .then(res => {
        console.log("Response", res);
         const outputSpeech =`The status of column id ${id} is change to ${status}`

        return handlerInput.responseBuilder
          .speak(outputSpeech)
          .reprompt()
          .getResponse();      
      })
      .catch(function(error){
          console.log("ERROR",error);
          
          return handlerInput.responseBuilder
          .speak(error.status)
          .reprompt()
          .getResponse();
      });
}

// The method returns information of a specific intervention
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
    outputSpeech = `The intervention ${id} author id is ${infoIntervention.author}, the customer id is ${infoIntervention.customer_id}.
    The building id is ${infoIntervention.building_id}. the battery id is ${infoIntervention.battery_id}, the column id is ${infoIntervention.column_id} and the elevator id is ${infoIntervention.elevator_id}.
    The employee id assigned to the call is ${infoIntervention.employee_id}, the description is ${infoIntervention.report}`;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// The method returns the status of a specific intervention
const GetInterventionStatusHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetInterventionStatusIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    
    // Call the API and return a list of the elevators   
    const listOfInterventions = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/interventions')
    const amountOfInterventions = JSON.parse(listOfInterventions).length
    
    // Validates if the number requested does not exceed the maximum number of elevators
    if (id > amountOfInterventions) {
        
    outputSpeech = `The ${id} exceed the number of interventions. The total number of interventions is ${amountOfInterventions} `;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    const interventionStatus = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/interventions/' + id + "/status")
    
    // Creating the voice output with the status of the elevator        
    outputSpeech = `The status of intervention ${id} is ${interventionStatus} `;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// The method change the status of a specific intervention to InProgress
const ChangeInterventionStatusToProgressHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeInterventionStatusToInProgressIntent"
    );
  },
  async handle(handlerInput) {

    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;

    // Call the API and return a list of the elevators   
    const listOfInterventions = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/interventions')
    const amountOfInterventions = JSON.parse(listOfInterventions).length
    
    // Validates if the number requested does not exceed the maximum number of elevators
    if (id > amountOfInterventions) {

      const outputSpeech = `The ${id} exceed the number of intervention. The maximum number of interventions is ${amountOfInterventions}`;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    } else{
      return ChangeInterventionStatusInProgress(id, handlerInput);
    }
  }
};

async function ChangeInterventionStatusInProgress(id, handlerInput) {
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
          .speak(error.status)
          .reprompt()
          .getResponse();
      });
}

// The method change the status of a specific intervention to Completed
const ChangeInterventionStatusToCompletedHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeInterventionStatusToCompletedIntent"
    );
  },
  async handle(handlerInput) {
         
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;

    // Call the API and return a list of the elevators   
    const listOfInterventions = await getRemoteData('https://rocket-elevators-ai.azurewebsites.net/api/interventions')
    const amountOfInterventions = JSON.parse(listOfInterventions).length
    
    // Validates if the number requested does not exceed the maximum number of elevators
    if (id > amountOfInterventions) {

      const outputSpeech = `The ${id} exceed the number of intervention. The maximum number of interventions is ${amountOfInterventions}`;
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    } else{
      return ChangeInterventionStatusCompleted(id, handlerInput);
    }
  }
};

async function ChangeInterventionStatusCompleted(id, handlerInput) {
  return await axios.put("https://rocket-elevators-ai.azurewebsites.net/api/interventions/"+id+"/completed",{ id: id, status: 'Completed'})
      .then(res => {
        console.log("Response", res);
        const outputSpeech =` The status of intervention id ${id} is change to completed`

        return handlerInput.responseBuilder
          .speak(outputSpeech)
          .reprompt()
          .getResponse();      
      })
      .catch(function(error){
          console.log("ERROR",error);
          
          return handlerInput.responseBuilder
          .speak(error.status)
          .reprompt()
          .getResponse();
      });
}

//--------------------------

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "Here is the list of all commands : what is the status of elevator {id},Can you tell me the status of elevator {id},what is the details of elevator {id}, how many Inactive elevators, change elevator {id} status to {status}, change status to {status} for elevator {id}, how rocket elevators is going, what happen at rocket elevators, what is going on, what is the serial number of elevator {id}, what is the SN of elevator {id}, can you tell me the serial number of elevator {id}, give me some information about elevator {id}, what happen with the elevator {id}, can you tell me some information about elevator {id}";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};
//-----------------------------------------
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
    GetElevatordetails,
    ChangeElevatorStatusHandler,
    GetCustomersdetails,
    GetColumnStatusHandler,
    ChangeColumnStatusHandler,
    GetInfoInterventionHandler,
    GetInterventionStatusHandler,
    ChangeInterventionStatusToProgressHandler,
    ChangeInterventionStatusToCompletedHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,     
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
