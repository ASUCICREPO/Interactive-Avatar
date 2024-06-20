## Prerequisites

Before you can run the demos, you will need to set up a few thing in your AWS account. For step-by-step instructions on setting up this required infrastructure, see [AWS-Infrastructure-Setup.md](AWS-Infrastructure-Setup.md).

## Local Environment Setup

In a terminal on your local machine, navigate to the repository root directory and run...

```
npm install
```

## Configuring Demo Credentials

In order for the demos to leverage the Cognito credentials you set up in the **Prerequisites** section you'll need to make the following edit...

Open the `src/demo-credentials.js` file editing.

Set the `cognitoIdentityPoolId` value to the Cognito Identity Pool you previously created. 

Save the edits you made to the `demo-credentials.js` file.

Your sample code credential setup is now complete! 🎉

## Configuring the Chatbot
Open `src/chatbotDemo.js` file, in the handleLexResponse function update "url" with your working Rest API endpoint url. 
This code snippet makes a POST request to an API, sends a JSON payload, and handles the response to perform certain actions based on the received data. Analyze the expected input format of your target API. Modify the JSON.stringify() structure to match this format.

Understand the structure of the response your API will return.
Adjust the conditional checks and data extraction logic.
If your API uses different keys or provides additional/different information, modify the accessors accordingly.

## Customizations

The chatbot interface displays a logo at top right corner. To replace or remove the logo, edit the img tag in the body of `src/chatbotDemo.html`. Add the required image to the assets folder. 

To change the pre-built host characters. Edit the characterId variable of createScene function available in `src/chatbotDemo.html` Available character IDs are:
"Cristine", "Fiona", "Grace", "Maya", "Jay", "Luke", "Preston", "Wes"

In the same function discussed above, edit the pollyConfig variable to use the voice & language of your choice. Check [Polly available voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html).

Use the `playGesture` function to play gestures along with the speech. Check the `gesturesDemo.js` file for available gestures list.



## Running the Demos Locally

In a terminal, navigate to repository root directory.

Start the demo server by running...

```
npm run start
```

This starts a local web server and launches new browser tab. Click on any demo to give it a try. Open the **Chatbotdemo** from the index page and interact with your avatar chatbot! 

When you're finished with the demos, you can quit the local dev server by pressing CTRL-C in the same terminal in which you started the server.

## Deploying the Demos to a Web Server

If you'd like to deploy the demos to a web server so that others can access them follow the steps below.

Run the following command which will build a deployable version of the web application.

```
npm run build
```

The command above outputs the deployable files to a "dist" folder. Deploy all the files inside the "dist" folder to your web server.

> ⚠️ **Important:** The "Chatbot Demo" requires access to the user's microphone for voice input. Browsers will only allow microphone access for websites hosted securely with SSL (over https://). Be sure your web server is configued to use SSL if you plan to use the "Chatbot Demo". Refer to webpack.config.js file to configure devServer if the application is being deployed to EC2.

For hosting these demos [AWS Amplify](https://aws.amazon.com/amplify) provides a simple drag-and-drop interface for hosting static web applications.

## Deploying Avatar Chatbot to ECS Fargate

Docker file is available in the chatbotdemo branch. Also change  `devServer` ( required code and explanation added in comments) located in the  `webpack.config.js` file while deploying to ECS Fargate.

Install Docker.

In a terminal, navigate to repository root directory.
Run these docker commands:

Build image
```
docker build -t avatarimg .
```
Run the below command and check port 8080 of localhost. The application should be running.
```
docker run -it -p 8080:8080 avatarimg
```
Push image to ECR and deploy to fargate. also setup load balancer with a https listening port( inorder to access mic).
