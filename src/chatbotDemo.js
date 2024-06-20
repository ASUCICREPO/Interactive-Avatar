import { HostObject, aws as AwsFeatures } from "@amazon-sumerian-hosts/babylon";
import { Scene } from "@babylonjs/core/scene";
import DemoUtils from "./demo-utils";
import { cognitoIdentityPoolId } from "./demo-credentials.js";


let host;
let scene;

async function createScene() {
  // Create an empty scene. 
  // right-hand or left-hand coordinate system for babylon scene
  scene = new Scene();
  scene.useRightHandedSystem = true;

  const { shadowGenerator } = DemoUtils.setupSceneEnvironment(scene);

  AWS.config.region = cognitoIdentityPoolId.split(":")[0];
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
  });


  // Edit the characterId if you would like to use one of
  // the other pre-built host characters. Available character IDs are:
  // "Cristine", "Fiona", "Grace", "Maya", "Jay", "Luke", "Preston", "Wes"
  const characterId = "Maya";
  const pollyConfig = { pollyVoice: "Joanna", pollyEngine: "neural" };
  const characterConfig = HostObject.getCharacterConfig(
    "./assets/character-assets",
    characterId
  );
  host = await HostObject.createHost(scene, characterConfig, pollyConfig);

  // Tell the host to always look at the camera.
  host.PointOfInterestFeature.setTarget(scene.activeCamera);
  
  // Enable shadows.
  scene.meshes.forEach((mesh) => {
    shadowGenerator.addShadowCaster(mesh);
  });

  const lexClient = new AWS.LexRuntime();
  const botConfig = {
    botName: "BookTrip",
    botAlias: "Dev",
  };
  lex = new AwsFeatures.LexFeature(lexClient, botConfig);

  initUi();
  initConversationManagement();
  acquireMicrophoneAccess();

  return scene;
}

function initUi() {
  document.getElementById("startButton").onclick = () => startMainExperience();
  document.getElementById("enableMicButton").onclick = () => acquireMicrophoneAccess();
  document.getElementById("stopSpeechButton").onclick = () => stopHostSpeaking(); 
}

/**
 * Triggered when the user clicks the initial "start" button.
 */
function startMainExperience() {
  showUiScreen("chatbotUiScreen");
  host.TextToSpeechFeature.play(`Hi, I'm healthcare chatbot. How can I help you today?`);
  document.getElementById('helloWorldContainer').style.display = 'block';
  document.getElementById("logo").style.display = "block";
}


let messageContainerEl;
let transcriptTextEl;
let lex;

function initConversationManagement() {
  // Setup button interactions
  const talkButton = document.getElementById("talkButton");
  talkButton.onmousedown = () => lex.beginVoiceRecording();
  talkButton.onmouseup = () => lex.endVoiceRecording();
  
  // Create convenience references to DOM elements.
  messageContainerEl = document.getElementById("userMessageContainer");
  transcriptTextEl = document.getElementById("transcriptText");

  // Use events dispatched by the LexFeature to manage UI messages and handle responses.
  const { EVENTS } = AwsFeatures.LexFeature;
  lex.listenTo(EVENTS.recordBegin, () => hideUserMessages());
  lex.listenTo(EVENTS.recordEnd, () => displayProcessingMessage());

  // Get the "Speak" button and set up a click event listener
  const speakButton = document.getElementById("TextButton");
  speakButton.addEventListener('click', () => {
    const speech = document.getElementById('Text').value; 
    if (speech.trim() !== "") { 
      const TextResponse = { inputTranscript: speech }; 
      handleLexResponse(TextResponse); 
    } else {
      console.log("No text entered."); 
    }
  });

  
  lex.listenTo(EVENTS.lexResponseReady, async (response) => {
    await handleLexResponse(response);
  });
}

async function handleLexResponse(response) {
  // Remove "processing" CSS class from message container.
  messageContainerEl.classList.remove("processing");

  // Display the user's speech input transcript.
  displaySpeechInputTranscript(response.inputTranscript);

  const prependString = "Answer in a concise manner: ";
  const modifiedTranscript = prependString + response.inputTranscript;
  //const modifiedTranscript = response.inputTranscript;

  const url = "https://api_endpoint_url";

  console.log('### Sending HTTP POST request ###');

  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: modifiedTranscript
          }]
        }]
      })
    });

    if (!fetchResponse.ok) {
      throw new Error('Network response was not ok: ' + fetchResponse.statusText);
    }

    const data = await fetchResponse.json();
    console.log("Data received:", data);

    
    if (data && 'response' in data) {
      const resultText = data.response;
      console.log('Processed response:', resultText);
      if (data.PHI_validation) {
        // PHI_validation is true
        const keywords = data.PHI_entities.map(entity => entity['Type']).join(', ');
        console.log('PHI Validation is true. Handling sensitive data.');
        const gesture_name = "defense";
        playGesture(gesture_name);
        const PHI_Message = "Oh no! private information, cannot disclose. Avoid using keywords such as,"
        const finalmsg = PHI_Message + keywords;
        console.log('final response:', finalmsg);
        host.TextToSpeechFeature.play(finalmsg);
      } else {
        // PHI_validation is false
        console.log('PHI Validation is false. Proceeding with standard operations.');
        host.TextToSpeechFeature.play(resultText);
      }
    } else {
      throw new Error("Unexpected response structure or missing data.");
    }
    
  } catch (error) {
    console.error("Error during Fetch operation:", error);
    host.TextToSpeechFeature.play("Sorry, I could not retrieve a response from the model.");
  }
}








function displaySpeechInputTranscript(text) {
  transcriptTextEl.innerText = `“${text}”`;
  messageContainerEl.classList.add("showingMessage");
}

function displayProcessingMessage() {
  messageContainerEl.classList.add("processing");
}

function hideUserMessages() {
  messageContainerEl.classList.remove("showingMessage");
}

async function acquireMicrophoneAccess() {
  showUiScreen("micInitScreen");

  try {
    await lex.enableMicInput();
    showUiScreen("startScreen");
  } catch (e) {
    // The user or browser denied mic access. Display appropriate messaging to the user.
    if (e.message === "Permission dismissed") {
      showUiScreen("micPermissionDismissedScreen");
    } else {
      showUiScreen("micDisabledScreen");
    }
  }
}

function showUiScreen(id) {
  document.querySelectorAll("#uiScreens .screen").forEach((element) => {
    const isTargetScreen = element.id === id;
    setElementVisibility(element.id, isTargetScreen);
  });
}

function setElementVisibility(id, visible) {
  const element = document.getElementById(id);
  if (visible) {
    element.classList.remove("hide");
  } else {
    element.classList.add("hide");
  }
}

function playGesture(name) {
  if (!name) return;

  const gestureOptions = {
    holdTime: 1.5, // how long the gesture should last
    minimumInterval: 0, // how soon another gesture can be triggered
  };
  host.GestureFeature.playGesture('Gesture', name, gestureOptions);
}

function stopHostSpeaking() {
  if (host && host.TextToSpeechFeature) {
    host.TextToSpeechFeature.stop(); // Directly use the stop method
    console.log("Speech stopped.");
  }
}

DemoUtils.loadDemo(createScene);
